import { Router, Request, Response } from "express";
import {
  fetchKeepaProductFull,
  fetchKeepaProductByCode,
  searchKeepaProducts,
  getKeepaTokenStatus,
  KeepaFullProduct,
} from "../services/keepa";

const router = Router();

const productCache = new Map<string, { data: KeepaFullProduct; timestamp: number }>();
const notFoundCache = new Map<string, number>();
const PRODUCT_CACHE_TTL = 30 * 60 * 1000;
const NOT_FOUND_TTL = 10 * 60 * 1000;
const SEARCH_CACHE_TTL = 15 * 60 * 1000;

const searchCache = new Map<string, { data: any; timestamp: number }>();

function getCachedProduct(key: string): KeepaFullProduct | null {
  const entry = productCache.get(key);
  if (entry && Date.now() - entry.timestamp < PRODUCT_CACHE_TTL) {
    console.log(`[Keepa Cache] HIT for ${key}`);
    return entry.data;
  }
  productCache.delete(key);
  return null;
}

function setCacheProduct(key: string, data: KeepaFullProduct) {
  productCache.set(key, { data, timestamp: Date.now() });
}

function isNotFoundCached(key: string): boolean {
  const ts = notFoundCache.get(key);
  if (ts && Date.now() - ts < NOT_FOUND_TTL) {
    return true;
  }
  notFoundCache.delete(key);
  return false;
}

function setNotFoundCache(key: string) {
  notFoundCache.set(key, Date.now());
}

router.get("/api/product/asin/:asin", async (req: Request, res: Response) => {
  try {
    if (!process.env.KEEPA_API_KEY) {
      return res.status(500).json({ error: "KEEPA_API_KEY is not configured" });
    }

    const asin = req.params.asin as string;
    const cacheKey = `asin:${asin}`;

    const cached = getCachedProduct(cacheKey);
    if (cached) {
      return res.json({ product: cached.product });
    }

    if (isNotFoundCached(cacheKey)) {
      return res.status(404).json({ error: "Product not found", product: null });
    }

    const result = await fetchKeepaProductFull(asin);
    if (!result) {
      setNotFoundCache(cacheKey);
      return res.status(404).json({ error: "Product not found", product: null });
    }

    setCacheProduct(cacheKey, result);
    return res.json({ product: result.product });
  } catch (error: any) {
    console.error("Error fetching product by ASIN:", error.message);
    return res.status(500).json({ error: error.message || "Failed to fetch product data" });
  }
});

router.get("/api/product/upc/:upc", async (req: Request, res: Response) => {
  try {
    if (!process.env.KEEPA_API_KEY) {
      return res.status(500).json({ error: "KEEPA_API_KEY is not configured" });
    }

    const upc = req.params.upc as string;
    const cacheKey = `upc:${upc}`;

    const cached = getCachedProduct(cacheKey);
    if (cached) {
      return res.json({ product: cached.product });
    }

    if (isNotFoundCached(cacheKey)) {
      return res.status(404).json({ error: "Product not found", product: null });
    }

    const result = await fetchKeepaProductByCode(upc);
    if (!result) {
      setNotFoundCache(cacheKey);
      return res.status(404).json({ error: "Product not found", product: null });
    }

    setCacheProduct(cacheKey, result);
    const asinKey = `asin:${result.product.asin}`;
    setCacheProduct(asinKey, result);

    return res.json({ product: result.product });
  } catch (error: any) {
    console.error("Error fetching product by UPC:", error.message);
    return res.status(500).json({ error: error.message || "Failed to fetch product data" });
  }
});

router.get("/api/product/search/:query", async (req: Request, res: Response) => {
  try {
    if (!process.env.KEEPA_API_KEY) {
      return res.status(500).json({ error: "KEEPA_API_KEY is not configured" });
    }

    const query = req.params.query as string;
    const cacheKey = `search:${query.toLowerCase()}`;

    const cachedSearch = searchCache.get(cacheKey);
    if (cachedSearch && Date.now() - cachedSearch.timestamp < SEARCH_CACHE_TTL) {
      return res.json({ products: cachedSearch.data });
    }

    const { products } = await searchKeepaProducts(query);
    searchCache.set(cacheKey, { data: products, timestamp: Date.now() });
    return res.json({ products });
  } catch (error: any) {
    console.error("Error searching products:", error.message);
    return res.status(500).json({ error: error.message || "Failed to search products" });
  }
});

router.get("/api/keepa/product/:asin", async (req: Request, res: Response) => {
  try {
    if (!process.env.KEEPA_API_KEY) {
      return res.status(500).json({ error: "KEEPA_API_KEY is not configured" });
    }

    const asin = req.params.asin as string;
    const cacheKey = `asin:${asin}`;

    const cached = getCachedProduct(cacheKey);
    if (cached) {
      return res.json({
        priceHistory: cached.priceHistory,
        rankHistory: cached.rankHistory,
        tokensLeft: cached.tokensLeft,
        refillRate: cached.refillRate,
      });
    }

    if (isNotFoundCached(cacheKey)) {
      return res.json({ priceHistory: [], rankHistory: [] });
    }

    const result = await fetchKeepaProductFull(asin);
    if (!result) {
      setNotFoundCache(cacheKey);
      return res.json({ priceHistory: [], rankHistory: [] });
    }

    setCacheProduct(cacheKey, result);
    return res.json({
      priceHistory: result.priceHistory,
      rankHistory: result.rankHistory,
      tokensLeft: result.tokensLeft,
      refillRate: result.refillRate,
    });
  } catch (error: any) {
    console.error("[Keepa] Error fetching product:", error.message);
    return res.status(500).json({ error: error.message || "Failed to fetch Keepa data" });
  }
});

router.get("/api/keepa/tokens", async (_req: Request, res: Response) => {
  try {
    if (!process.env.KEEPA_API_KEY) {
      return res.status(500).json({ error: "KEEPA_API_KEY is not configured" });
    }
    const status = await getKeepaTokenStatus();
    return res.json(status);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
