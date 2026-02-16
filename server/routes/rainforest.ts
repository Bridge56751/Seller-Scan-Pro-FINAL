import { Router, Request, Response } from "express";
import {
  fetchProductByAsin,
  fetchProductByGtin,
  searchProducts,
  transformProductResponse,
  transformSearchResults,
} from "../services/rainforest";

const router = Router();

const productCache = new Map<string, { data: any; timestamp: number }>();
const notFoundCache = new Map<string, number>();
const CACHE_TTL = 30 * 60 * 1000;
const NOT_FOUND_TTL = 10 * 60 * 1000;

function getCached(key: string): any | null {
  const entry = productCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  productCache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
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
    if (!process.env.RAINFOREST_API_KEY) {
      return res.status(500).json({ error: "RAINFOREST_API_KEY is not configured" });
    }

    const { asin } = req.params;
    const cacheKey = `asin:${asin}`;

    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ product: cached });
    }

    if (isNotFoundCached(cacheKey)) {
      return res.status(404).json({ error: "Product not found", product: null });
    }

    const data = await fetchProductByAsin(asin);
    if (!data.product) {
      setNotFoundCache(cacheKey);
      return res.status(404).json({ error: "Product not found", product: null });
    }
    const product = transformProductResponse(data);
    setCache(cacheKey, product);
    return res.json({ product });
  } catch (error: any) {
    console.error("Error fetching product by ASIN:", error.message);
    return res.status(500).json({ error: error.message || "Failed to fetch product data" });
  }
});

router.get("/api/product/upc/:upc", async (req: Request, res: Response) => {
  try {
    if (!process.env.RAINFOREST_API_KEY) {
      return res.status(500).json({ error: "RAINFOREST_API_KEY is not configured" });
    }

    const { upc } = req.params;
    const cacheKey = `upc:${upc}`;

    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ product: cached });
    }

    if (isNotFoundCached(cacheKey)) {
      return res.status(404).json({ error: "Product not found", product: null });
    }

    const [gtinResult, searchResult] = await Promise.allSettled([
      fetchProductByGtin(upc),
      searchProducts(upc),
    ]);

    const gtinData = gtinResult.status === "fulfilled" ? gtinResult.value : null;
    if (gtinData?.product) {
      const product = transformProductResponse(gtinData);
      setCache(cacheKey, product);
      return res.json({ product });
    }

    const searchData = searchResult.status === "fulfilled" ? searchResult.value : null;
    const searchResults = searchData?.search_results || [];
    if (searchResults.length > 0) {
      const asin = searchResults[0].asin;
      if (asin) {
        const asinCacheKey = `asin:${asin}`;
        const asinCached = getCached(asinCacheKey);
        if (asinCached) {
          setCache(cacheKey, asinCached);
          return res.json({ product: asinCached });
        }

        const productData = await fetchProductByAsin(asin);
        if (productData.product) {
          const product = transformProductResponse(productData);
          setCache(cacheKey, product);
          setCache(asinCacheKey, product);
          return res.json({ product });
        }
      }
    }

    setNotFoundCache(cacheKey);
    return res.status(404).json({ error: "Product not found", product: null });
  } catch (error: any) {
    console.error("Error fetching product by UPC:", error.message);
    return res.status(500).json({ error: error.message || "Failed to fetch product data" });
  }
});

router.get("/api/product/search/:query", async (req: Request, res: Response) => {
  try {
    if (!process.env.RAINFOREST_API_KEY) {
      return res.status(500).json({ error: "RAINFOREST_API_KEY is not configured" });
    }

    const { query } = req.params;
    const cacheKey = `search:${query}`;

    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ products: cached });
    }

    const data = await searchProducts(query);
    const products = transformSearchResults(data);
    setCache(cacheKey, products);
    return res.json({ products });
  } catch (error: any) {
    console.error("Error searching products:", error.message);
    return res.status(500).json({ error: error.message || "Failed to search products" });
  }
});

export default router;
