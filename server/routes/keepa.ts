import { Router, Request, Response } from "express";
import { fetchKeepaProduct, getKeepaTokenStatus } from "../services/keepa";

const router = Router();

const keepaCache = new Map<string, { data: any; timestamp: number }>();
const notFoundCache = new Map<string, number>();
const CACHE_TTL = 24 * 60 * 60 * 1000;
const NOT_FOUND_TTL = 60 * 60 * 1000;

function getCached(key: string): any | null {
  const entry = keepaCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    console.log(`[Keepa Cache] HIT for ${key}`);
    return entry.data;
  }
  keepaCache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  keepaCache.set(key, { data, timestamp: Date.now() });
}

function isNotFoundCached(key: string): boolean {
  const ts = notFoundCache.get(key);
  if (ts && Date.now() - ts < NOT_FOUND_TTL) {
    return true;
  }
  notFoundCache.delete(key);
  return false;
}

router.get("/api/keepa/product/:asin", async (req: Request, res: Response) => {
  try {
    if (!process.env.KEEPA_API_KEY) {
      return res.status(500).json({ error: "KEEPA_API_KEY is not configured" });
    }

    const { asin } = req.params;
    const cacheKey = `keepa:${asin}`;

    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    if (isNotFoundCached(cacheKey)) {
      return res.json({ priceHistory: [], rankHistory: [], cached: true });
    }

    console.log(`[Keepa] Fetching history for ASIN: ${asin}`);
    const result = await fetchKeepaProduct(asin);

    if (!result || (result.priceHistory.length === 0 && result.rankHistory.length === 0)) {
      notFoundCache.set(cacheKey, Date.now());
      return res.json({ priceHistory: [], rankHistory: [], tokensLeft: result?.tokensLeft || 0 });
    }

    const responseData = {
      priceHistory: result.priceHistory,
      rankHistory: result.rankHistory,
      tokensLeft: result.tokensLeft,
      refillRate: result.refillRate,
    };

    setCache(cacheKey, responseData);
    return res.json(responseData);
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
