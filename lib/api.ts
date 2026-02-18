import { getApiUrl } from "./query-client";
import type { ProductData, PricePoint, RankPoint } from "./mock-data";
import { lookupByBarcode, lookupByAsin, searchProducts as mockSearch } from "./mock-data";

const API_BASE = getApiUrl();

export interface KeepaChartData {
  priceHistory: PricePoint[];
  rankHistory: RankPoint[];
  tokensLeft?: number;
  refillRate?: number;
}

async function fetchJson(path: string) {
  const url = new URL(path, API_BASE).toString();
  const res = await fetch(url);
  if (res.status === 404) {
    return { notFound: true };
  }
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
    if (data.notFound) return null;
    if (data.product) return data.product;
    return null;
  } catch (err: any) {
    if (err.message?.includes("not configured")) return null;
    return null;
  }
}

export async function lookupProductByASIN(asin: string): Promise<ProductData | null> {
  const mock = lookupByAsin(asin);
  if (mock) return mock;

  try {
    const data = await fetchJson(`/api/product/asin/${encodeURIComponent(asin)}`);
    if (data.notFound) return null;
    if (data.product) return data.product;
    return null;
  } catch (err: any) {
    if (err.message?.includes("not configured")) return null;
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
    if (data.notFound) return [];
    if (data.products && Array.isArray(data.products)) return data.products;
    return [];
  } catch (err: any) {
    if (err.message?.includes("not configured")) return [];
    return [];
  }
}

export async function fetchKeepaChartData(asin: string): Promise<KeepaChartData> {
  try {
    const data = await fetchJson(`/api/keepa/product/${encodeURIComponent(asin)}`);
    if (data.notFound) return { priceHistory: [], rankHistory: [] };
    return {
      priceHistory: data.priceHistory || [],
      rankHistory: data.rankHistory || [],
      tokensLeft: data.tokensLeft,
      refillRate: data.refillRate,
    };
  } catch {
    return { priceHistory: [], rankHistory: [] };
  }
}
