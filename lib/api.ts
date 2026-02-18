import { getApiUrl } from "./query-client";
import type { ProductData, PricePoint, RankPoint } from "./mock-data";

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
  try {
    const data = await fetchJson(`/api/product/upc/${encodeURIComponent(upc)}`);
    if (data.notFound) return null;
    if (data.product) return data.product;
    return null;
  } catch (err: any) {
    console.error("UPC lookup error:", err.message);
    return null;
  }
}

export async function lookupProductByASIN(asin: string): Promise<ProductData | null> {
  try {
    const data = await fetchJson(`/api/product/asin/${encodeURIComponent(asin)}`);
    if (data.notFound) return null;
    if (data.product) return data.product;
    return null;
  } catch (err: any) {
    console.error("ASIN lookup error:", err.message);
    return null;
  }
}

export async function searchProductsAPI(query: string): Promise<ProductData[]> {
  try {
    const data = await fetchJson(`/api/product/search/${encodeURIComponent(query)}`);
    if (data.notFound) return [];
    if (data.products && Array.isArray(data.products)) return data.products;
    return [];
  } catch (err: any) {
    console.error("Search error:", err.message);
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
