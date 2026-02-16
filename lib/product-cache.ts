import type { ProductData } from "./mock-data";

const cache = new Map<string, ProductData>();

export function cacheProduct(product: ProductData) {
  if (product.asin) cache.set(product.asin, product);
  if (product.upc) cache.set(product.upc, product);
}

export function getCachedProduct(key: string): ProductData | null {
  return cache.get(key) || null;
}

export function clearProductCache() {
  cache.clear();
}
