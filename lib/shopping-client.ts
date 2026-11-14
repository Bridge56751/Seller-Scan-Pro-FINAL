import { getApiUrl } from "./query-client";
import { prepareProductPhoto } from "./native-camera";
import { throwIfCanceled } from "@/shared/cancellation";
import type { BarcodeProduct } from "@/shared/barcode";
import { type Identification, type Comparison, type ComparisonInput, type ListingSearchInput, type ListingSearch } from "@/shared/shopping";

async function shoppingRequest<T>(route: string, body: unknown, signal?: AbortSignal): Promise<T> {
  throwIfCanceled(signal);
  const started = Date.now();
  const stage = route === "identify" ? "Photo identification" : route === "barcode" ? "Barcode identification" : "Price search";
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener("abort", cancel);
  const timeout = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(new URL(`/api/shopping/${route}`, getApiUrl()).href, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    throwIfCanceled(signal);
    if (!response.ok) throw new Error(data?.error || "The shopping service is unavailable. Please try again.");
    if (!data) throw new Error("The shopping service returned an unreadable response.");
    return data as T;
  } catch (error) {
    throwIfCanceled(signal);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`${stage} took too long. Check your connection and retry this step.`);
    }
    if (error instanceof TypeError) throw new Error(`${stage} could not reach the server. Check your connection and retry.`);
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", cancel);
    console.info("[Shopping timing]", JSON.stringify({ step: route, durationMs: Date.now() - started }));
  }
}

// Only called for a user-accepted camera photo or an explicit retry.
export async function identifyPhoto(uri: string, country: string, signal?: AbortSignal) {
  throwIfCanceled(signal);
  const start = Date.now();
  let image: string;
  try { image = await prepareProductPhoto(uri); }
  catch { throwIfCanceled(signal); throw new Error("This photo could not be prepared. Please take another photo."); }
  finally { console.info("[Shopping timing]", JSON.stringify({ step: "photoPreparation", durationMs: Date.now() - start })); }
  throwIfCanceled(signal);
  return shoppingRequest<Identification>("identify", { image, country }, signal);
}
export function compareProduct(input: ComparisonInput) {
  return shoppingRequest<Comparison>("compare", input);
}
export function searchListings(input: ListingSearchInput, signal?: AbortSignal) {
  return shoppingRequest<ListingSearch>("search", input, signal);
}
export function identifyBarcode(barcode: string, signal?: AbortSignal) {
  return shoppingRequest<BarcodeProduct>("barcode", { barcode }, signal);
}
