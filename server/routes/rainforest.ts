import { Router, Request, Response } from "express";
import {
  fetchProductByAsin,
  fetchProductByGtin,
  searchProducts,
  transformProductResponse,
  transformSearchResults,
} from "../services/rainforest";

const router = Router();

router.get("/api/product/asin/:asin", async (req: Request, res: Response) => {
  try {
    if (!process.env.RAINFOREST_API_KEY) {
      return res.status(500).json({ error: "RAINFOREST_API_KEY is not configured. Please set the environment variable." });
    }

    const { asin } = req.params;
    const data = await fetchProductByAsin(asin);
    const product = transformProductResponse(data);
    return res.json(product);
  } catch (error: any) {
    console.error("Error fetching product by ASIN:", error.message);
    return res.status(500).json({ error: error.message || "Failed to fetch product data" });
  }
});

router.get("/api/product/upc/:upc", async (req: Request, res: Response) => {
  try {
    if (!process.env.RAINFOREST_API_KEY) {
      return res.status(500).json({ error: "RAINFOREST_API_KEY is not configured. Please set the environment variable." });
    }

    const { upc } = req.params;
    const data = await fetchProductByGtin(upc);
    const product = transformProductResponse(data);
    return res.json(product);
  } catch (error: any) {
    console.error("Error fetching product by UPC:", error.message);
    return res.status(500).json({ error: error.message || "Failed to fetch product data" });
  }
});

router.get("/api/product/search/:query", async (req: Request, res: Response) => {
  try {
    if (!process.env.RAINFOREST_API_KEY) {
      return res.status(500).json({ error: "RAINFOREST_API_KEY is not configured. Please set the environment variable." });
    }

    const { query } = req.params;
    const data = await searchProducts(query);
    const products = transformSearchResults(data);
    return res.json(products);
  } catch (error: any) {
    console.error("Error searching products:", error.message);
    return res.status(500).json({ error: error.message || "Failed to search products" });
  }
});

export default router;
