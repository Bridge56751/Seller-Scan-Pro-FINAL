import express, { Router, type Request, type Response, type NextFunction } from "express";
import sharp from "sharp";
import { z } from "zod";
import { comparisonSchema, countryInfo, listingSearchSchema } from "../../shared/shopping";
import { searchApi, ShoppingError, normalizeMatches, normalizeOffers, normalizeLensOffers, shoppingQuery } from "../services/searchapi";
import { storePhoto, deletePhoto, startPhotoCleanup } from "../services/photo-store";
import { authenticateDevice, DeviceError } from "../services/device-customers";
import { reserveScan, ScanLimitError } from "../services/scan-rate-limits";
import { randomUUID } from "node:crypto";
import { findListings } from "../services/listing-search";
import { throwIfCanceled } from "../../shared/cancellation";
import { lookupBarcode } from "../services/barcode-lookup";
import { normalizeBarcode } from "../../shared/barcode";

const router = Router();
startPhotoCleanup();
const photoSchema = z.object({
  image: z.string().min(100).max(4 * 1024 * 1024).regex(/^[A-Za-z0-9+/]+={0,2}$/),
  country: z.string().length(2).transform(v => v.toUpperCase()),
}).strict();

function requireCountry(code: string) {
  const country = countryInfo(code);
  if (!country) throw new ShoppingError(422, "REGION_UNAVAILABLE",
    "Comparisons are not available for this country yet. No US results have been substituted.");
  return country;
}

// Bounded anonymous access; photo searches allow at most one empty-result fallback.
let active = 0;
let windowStart = Date.now();
let count = 0;
function limit(_req: Request, res: Response, next: NextFunction) {
  if (Date.now() - windowStart >= 60000) { windowStart = Date.now(); count = 0; }
  if (active >= 3 || count >= 30) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "Too many searches. Please try again in a minute." });
  }
  count++; active++;
  let released = false;
  const release = () => { if (!released) { active--; released = true; } };
  res.locals.releaseSearch = release;
  res.once("finish", release);
  res.once("close", release);
  next();
}

router.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (req.method === "POST" && ["/identify", "/barcode", "/search", "/compare"].includes(req.path)) {
    const start = Date.now();
    const requestId = randomUUID();
    res.locals.timings = {};
    const controller = new AbortController();
    res.locals.scanSignal = controller.signal;
    const abort = () => controller.abort();
    const close = () => { if (!res.writableFinished) abort(); };
    req.once("aborted", abort);
    res.once("close", close);
    res.once("close", () => req.removeListener("aborted", abort));
    res.setHeader("X-Scan-Request-Id", requestId);
    res.once("finish", () => console.info("[Shopping]", JSON.stringify({
      requestId, step: req.path.slice(1), status: res.statusCode,
      durationMs: Date.now() - start, ...res.locals.timings, code: res.locals.failureCode,
    })));
  }
  next();
});
async function timed<T>(res: Response, stage: string, work: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try { return await work(); }
  finally { res.locals.timings[stage] = Date.now() - start; }
}
router.post("/identify", limit, express.json({ limit: "5mb" }), async (req, res, next) => {
  let id: string | undefined;
  try {
    const input = photoSchema.parse(req.body);
    const device = await timed(res, "deviceAuthenticationMs", () => authenticateDevice(req));
    throwIfCanceled(res.locals.scanSignal);
    requireCountry(input.country);
    if (!process.env.SEARCHAPI_API_KEY) throw new ShoppingError(503, "NOT_CONFIGURED", "Shopping service is not configured yet.");
    const raw = Buffer.from(input.image, "base64");
    let image: Buffer;
    try {
      image = await timed(res, "imagePrepareMs", () => sharp(raw, { limitInputPixels: 20_000_000, animated: false })
        .rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer());
    } catch {
      throw new ShoppingError(400, "INVALID_IMAGE", "That photo could not be read. Please take another photo.");
    }
    throwIfCanceled(res.locals.scanSignal);
    const allowance = await reserveScan(device.customer_id, true, undefined, "photo");
    throwIfCanceled(res.locals.scanSignal);
    const stored = await timed(res, "photoStorageMs", () => storePhoto(image)).catch(() => {
      throw new ShoppingError(503, "PHOTO_STORAGE_UNAVAILABLE", "Your photo could not be prepared for identification. Please retry.");
    });
    id = stored.id;
    throwIfCanceled(res.locals.scanSignal);
    const data = await timed(res, "identificationMs", () => searchApi({
      engine: "google_lens", search_type: "visual_matches", country: input.country,
      hl: "en", url: stored.url,
    }, { signal: res.locals.scanSignal }));
    throwIfCanceled(res.locals.scanSignal);
    const matches = normalizeMatches(data);
    res.locals.timings.matchCount = matches.length;
    res.json({ matches, country: input.country, scanPermit: allowance.scanPermit,
      result: { ...normalizeLensOffers(data), country: input.country,
        currency: countryInfo(input.country)![2], fetchedAt: new Date().toISOString(),
        query: matches[0]?.title || "", matchStatus: "possible" } });
  } catch (error) { next(error); }
  finally {
    if (id) await deletePhoto(id).catch(() =>
      console.warn("[Shopping] Photo cleanup delayed; link expires automatically."));
    res.locals.releaseSearch?.();
  }
});

router.post("/barcode", limit, express.json({ limit: "1kb" }), async (req, res, next) => {
  try {
    const input = z.object({ barcode: z.string().max(14).refine(value => !!normalizeBarcode(value)) }).strict().parse(req.body);
    const device = await authenticateDevice(req);
    throwIfCanceled(res.locals.scanSignal);
    const allowance = await reserveScan(device.customer_id, true, undefined, "barcode");
    throwIfCanceled(res.locals.scanSignal);
    const product = await timed(res, "barcodeLookupMs", () => lookupBarcode(input.barcode, res.locals.scanSignal));
    throwIfCanceled(res.locals.scanSignal);
    res.json({ ...product, scanPermit: allowance.scanPermit });
  } catch (error) { next(error); }
  finally { res.locals.releaseSearch?.(); }
});

// Results-first searches are suggestions, not a claim that the shopper confirmed a variant.
router.post("/search", limit, express.json({ limit: "8kb" }), async (req, res, next) => {
  try {
    const input = listingSearchSchema.parse(req.body);
    const country = requireCountry(input.country);
    const device = await authenticateDevice(req);
    throwIfCanceled(res.locals.scanSignal);
    await reserveScan(device.customer_id, false, req.get("x-scan-permit"));
    throwIfCanceled(res.locals.scanSignal);
    const result = await timed(res, "listingSearchMs", () => findListings(input, country[2], searchApi,
      (attempt, ms, offers) => {
        res.locals.timings[`attempt${attempt}Ms`] = ms;
        res.locals.timings[`attempt${attempt}Offers`] = offers;
      }, res.locals.scanSignal));
    throwIfCanceled(res.locals.scanSignal);
    res.locals.timings.offerCount = result.offers.length;
    res.locals.timings.excludedCount = result.excluded;
    res.locals.timings.fallbackUsed = result.fallbackUsed;
    res.json(result);
  } catch (error) { next(error); }
  finally { res.locals.releaseSearch?.(); }
});

router.post("/compare", limit, express.json({ limit: "8kb" }), async (req, res, next) => {
  try {
    const input = comparisonSchema.parse(req.body);
    const country = requireCountry(input.country);
    const device = await authenticateDevice(req);
    throwIfCanceled(res.locals.scanSignal);
    await reserveScan(device.customer_id);
    throwIfCanceled(res.locals.scanSignal);
    const data = await timed(res, "listingSearchMs", () => searchApi({
      engine: "google_shopping", q: shoppingQuery(input), gl: input.country.toLowerCase(),
      hl: "en", condition: input.condition, link: "raw",
    }, { signal: res.locals.scanSignal }));
    throwIfCanceled(res.locals.scanSignal);
    res.json({
      ...normalizeOffers(data, input, country[2]),
      country: input.country, currency: country[2], fetchedAt: new Date().toISOString(),
    });
  } catch (error) { next(error); }
  finally { res.locals.releaseSearch?.(); }
});

router.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  res.locals.releaseSearch?.();
  if (res.locals.scanSignal?.aborted || res.destroyed) return;
  res.locals.failureCode = error instanceof ShoppingError || error instanceof ScanLimitError ? error.code :
    error instanceof z.ZodError ? "INVALID_INPUT" : "REQUEST_FAILED";
  if (error instanceof z.ZodError) return res.status(400).json({
    error: "Check the photo or product details and the selected country, then try again.",
  });
  if (error instanceof ShoppingError) return res.status(error.status).json({ code: error.code, error: error.message });
  if (error instanceof DeviceError) return res.status(error.status).json({ error: error.message });
  if (error instanceof ScanLimitError) {
    if (error.retryAfter) res.setHeader("Retry-After", String(error.retryAfter));
    return res.status(error.status).json({ code: error.code, error: error.message, retryAfter: error.retryAfter });
  }
  if ((error as { type?: string })?.type === "entity.too.large") return res.status(413).json({ error: "Photo is too large. Please retake it." });
  console.warn("[Shopping] Request failed."); // No image data, tokens, provider responses or secrets.
  res.status(500).json({ error: "Could not complete the search. Please try again." });
});
export default router;
