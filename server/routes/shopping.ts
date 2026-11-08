import express, { Router, type Request, type Response, type NextFunction } from "express";
import sharp from "sharp";
import { z } from "zod";
import { comparisonSchema, countryInfo, listingSearchSchema } from "../../shared/shopping";
import { searchApi, ShoppingError, normalizeMatches, normalizeOffers, shoppingQuery } from "../services/searchapi";
import { storePhoto, readPhoto, deletePhoto } from "../services/photo-store";

const router = Router();
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

function publicOrigin(req: Request) {
  const host = req.get("x-forwarded-host") || req.get("host") || "";
  const allowed = [process.env.REPLIT_DEV_DOMAIN, process.env.REPLIT_INTERNAL_APP_DOMAIN, ...(process.env.REPLIT_DOMAINS || "").split(",")]
    .filter(Boolean).flatMap(d => [d!.trim(), `${d!.trim()}:5000`]);
  if (!allowed.includes(host)) throw new ShoppingError(503, "PHOTO_HOST_UNAVAILABLE",
    "Photo matching requires this app’s public HTTPS address. Please use the app’s configured server.");
  // The dev proxy drops the external port from forwarded Host. Expo owns port 443,
  // while the image endpoint is on the separately exposed backend port.
  if (process.env.NODE_ENV !== "production" && host.split(":")[0] === process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}:5000`;
  }
  return `https://${host}`;
}

// Bounded anonymous access; no unbounded waiting queue or automatic paid retries.
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
  next();
}

router.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});
router.get("/photo/:token", async (req, res, next) => {
  try {
    const bytes = await readPhoto(req.params.token);
    if (!bytes) return res.sendStatus(404);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.type("jpeg").send(bytes);
  } catch (error) { next(error); }
});

router.post("/identify", limit, express.json({ limit: "5mb" }), async (req, res, next) => {
  let id: string | undefined;
  try {
    const input = photoSchema.parse(req.body);
    requireCountry(input.country);
    if (!process.env.SEARCHAPI_API_KEY) throw new ShoppingError(503, "NOT_CONFIGURED", "Shopping service is not configured yet.");
    const origin = publicOrigin(req);
    const raw = Buffer.from(input.image, "base64");
    let image: Buffer;
    try {
      image = await sharp(raw, { limitInputPixels: 20_000_000, animated: false })
        .rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
    } catch {
      throw new ShoppingError(400, "INVALID_IMAGE", "That photo could not be read. Please take another photo.");
    }
    const stored = await storePhoto(image);
    id = stored.id;
    const data = await searchApi({
      engine: "google_lens", search_type: "visual_matches", country: input.country,
      hl: "en", url: `${origin}/api/shopping/photo/${stored.token}`,
    });
    res.json({ matches: normalizeMatches(data), country: input.country });
  } catch (error) { next(error); }
  finally {
    if (id) await deletePhoto(id).catch(() =>
      console.warn("[Shopping] Photo cleanup delayed; link expires automatically."));
    res.locals.releaseSearch?.();
  }
});

// Results-first searches are suggestions, not a claim that the shopper confirmed a variant.
router.post("/search", limit, express.json({ limit: "8kb" }), async (req, res, next) => {
  try {
    const input = listingSearchSchema.parse(req.body);
    const country = requireCountry(input.country);
    const data = await searchApi({
      engine: "google_shopping", q: input.query, gl: input.country.toLowerCase(),
      hl: "en", link: "resolved",
      ...(input.condition === "any" ? {} : { condition: input.condition }),
    });
    res.json({
      ...normalizeOffers(data, { product: input.query, size: "N/A", color: "N/A", quantity: 1, condition: input.condition, country: input.country }, country[2]),
      query: input.query, matchStatus: "possible",
      country: input.country, currency: country[2], fetchedAt: new Date().toISOString(),
    });
  } catch (error) { next(error); }
  finally { res.locals.releaseSearch?.(); }
});

router.post("/compare", limit, express.json({ limit: "8kb" }), async (req, res, next) => {
  try {
    const input = comparisonSchema.parse(req.body);
    const country = requireCountry(input.country);
    const data = await searchApi({
      engine: "google_shopping", q: shoppingQuery(input), gl: input.country.toLowerCase(),
      hl: "en", condition: input.condition, link: "resolved",
    });
    res.json({
      ...normalizeOffers(data, input, country[2]),
      country: input.country, currency: country[2], fetchedAt: new Date().toISOString(),
    });
  } catch (error) { next(error); }
  finally { res.locals.releaseSearch?.(); }
});

router.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  res.locals.releaseSearch?.();
  if (error instanceof z.ZodError) return res.status(400).json({
    error: "Check your photo, country, and product details. All variant fields and confirmation are required for price comparison.",
  });
  if (error instanceof ShoppingError) return res.status(error.status).json({ code: error.code, error: error.message });
  if ((error as { type?: string })?.type === "entity.too.large") return res.status(413).json({ error: "Photo is too large. Please retake it." });
  console.warn("[Shopping] Request failed."); // No image data, tokens, provider responses or secrets.
  res.status(500).json({ error: "Could not complete the search. Please try again." });
});
export default router;
