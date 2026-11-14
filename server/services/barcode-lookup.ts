import { normalizeBarcode, type BarcodeProduct } from "../../shared/barcode";
import { throwIfCanceled } from "../../shared/cancellation";
import { ShoppingError, productImageUrl } from "./searchapi";

const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
type Item = Record<string, unknown>;

export function normalizeBarcodeProduct(data: unknown, barcode: string): BarcodeProduct {
  const code = normalizeBarcode(barcode);
  if (!code) throw new ShoppingError(400, "INVALID_BARCODE", "This barcode is not a valid UPC or EAN product code.");
  const items = (data as { items?: unknown })?.items;
  const item = Array.isArray(items) ? items.find((row: Item) => row && typeof row === "object" &&
    [row.upc, row.ean, row.gtin].some(value => {
      const candidate = normalizeBarcode(clean(value));
      return candidate && candidate.padStart(14, "0") === code.padStart(14, "0");
    }) && clean(row.title).length >= 3) as Item | undefined : undefined;
  if (!item) throw new ShoppingError(404, "BARCODE_NOT_FOUND",
    "This barcode was not found in UPCitemdb. Try the photo Scan button instead.");
  const title = clean(item.title).slice(0, 500);
  const brand = clean(item.brand).slice(0, 100);
  const model = clean(item.model).slice(0, 100);
  const query = [brand && !title.toLowerCase().includes(brand.toLowerCase()) ? brand : "",
    title, model && !title.toLowerCase().includes(model.toLowerCase()) ? model : ""]
    .filter(Boolean).join(" ").slice(0, 180);
  const imageUrl = Array.isArray(item.images)
    ? item.images.map(image => productImageUrl(clean(image))).find(Boolean) ?? null : null;
  return { barcode: code, title, brand, query, imageUrl, source: "UPCitemdb" };
}

// Cache identities only, never prices. Bounded to avoid unbounded memory use.
export function createBarcodeLookup(fetcher: typeof fetch = (...args) => fetch(...args)) {
  const cache = new Map<string, { expires: number; product: BarcodeProduct }>();
  return async (rawCode: string, signal?: AbortSignal): Promise<BarcodeProduct> => {
    throwIfCanceled(signal);
    const barcode = normalizeBarcode(rawCode);
    if (!barcode) throw new ShoppingError(400, "INVALID_BARCODE", "This barcode is not a valid UPC or EAN product code.");
    const key = barcode.padStart(14, "0");
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) return { ...cached.product, barcode };
    cache.delete(key);
    const timeout = AbortSignal.timeout(15000);
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
    try {
      const response = await fetcher(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`, {
        headers: { Accept: "application/json" }, signal: combined,
      });
      if (response.status === 429) throw new ShoppingError(429, "BARCODE_LIMIT",
        "Free barcode lookup is temporarily at its limit. Try later or use photo Scan.");
      if (!response.ok) throw new ShoppingError(502, "BARCODE_UNAVAILABLE",
        "Barcode lookup is unavailable right now. Retry or use photo Scan.");
      const data = await response.json();
      throwIfCanceled(signal);
      if (data?.code !== "OK") throw new ShoppingError(502, "BARCODE_UNAVAILABLE",
        "Barcode lookup could not complete. Retry or use photo Scan.");
      const product = normalizeBarcodeProduct(data, barcode);
      if (cache.size >= 500) cache.delete(cache.keys().next().value!);
      cache.set(key, { expires: Date.now() + 24 * 60 * 60 * 1000, product });
      return product;
    } catch (error) {
      throwIfCanceled(signal);
      if (error instanceof ShoppingError) throw error;
      throw new ShoppingError(timeout.aborted ? 504 : 502, "BARCODE_UNAVAILABLE",
        timeout.aborted ? "Barcode lookup took too long. Retry or use photo Scan."
          : "Could not connect to barcode lookup. Retry or use photo Scan.");
    }
  };
}
export const lookupBarcode = createBarcodeLookup();
