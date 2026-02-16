import { getApiUrl } from "./query-client";
import type { ProductData } from "./mock-data";
import { lookupByBarcode, lookupByAsin, searchProducts as mockSearch } from "./mock-data";

const API_BASE = getApiUrl();

async function fetchJson(path: string) {
  const url = new URL(path, API_BASE).toString();
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function lookupProductByUPC(upc: string): Promise<ProductData | null> {
  const mock = lookupByBarcode(upc);
  if (mock) return mock;

  try {
    const data = await fetchJson(`/api/product/upc/${encodeURIComponent(upc)}`);
    if (data.product) return data.product;
    return null;
  } catch (err: any) {
    if (err.message?.includes("not configured")) return null;
    console.warn("API lookup failed for UPC:", upc, err.message);
    return null;
  }
}

export async function lookupProductByASIN(asin: string): Promise<ProductData | null> {
  const mock = lookupByAsin(asin);
  if (mock) return mock;

  try {
    const data = await fetchJson(`/api/product/asin/${encodeURIComponent(asin)}`);
    if (data.product) return data.product;
    return null;
  } catch (err: any) {
    if (err.message?.includes("not configured")) return null;
    console.warn("API lookup failed for ASIN:", asin, err.message);
    return null;
  }
}

export async function searchProductsAPI(query: string): Promise<ProductData[]> {
  const mockResults = mockSearch(query);
  if (mockResults.length > 0) return mockResults;

  const asinResult = lookupByAsin(query);
  if (asinResult) return [asinResult];
  const barcodeResult = lookupByBarcode(query);
  if (barcodeResult) return [barcodeResult];

  try {
    const data = await fetchJson(`/api/product/search/${encodeURIComponent(query)}`);
    if (data.products && Array.isArray(data.products)) return data.products;
    return [];
  } catch (err: any) {
    if (err.message?.includes("not configured")) return [];
    console.warn("API search failed:", query, err.message);
    return [];
  }
}
