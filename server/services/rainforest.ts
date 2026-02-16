import type { ProductData, Competitor, Alert } from "../../lib/mock-data";

const RAINFOREST_BASE_URL = "https://api.rainforestapi.com/request";

function getApiKey(): string {
  const key = process.env.RAINFOREST_API_KEY;
  if (!key) {
    throw new Error("RAINFOREST_API_KEY environment variable is not set");
  }
  return key;
}

export async function fetchProductByAsin(asin: string): Promise<any> {
  const apiKey = getApiKey();
  const url = `${RAINFOREST_BASE_URL}?api_key=${encodeURIComponent(apiKey)}&type=product&asin=${encodeURIComponent(asin)}&amazon_domain=amazon.com`;
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Rainforest API error (${response.status}): ${body}`);
  }
  return response.json();
}

export async function fetchProductByGtin(upc: string): Promise<any> {
  const apiKey = getApiKey();
  const url = `${RAINFOREST_BASE_URL}?api_key=${encodeURIComponent(apiKey)}&type=product&gtin=${encodeURIComponent(upc)}&amazon_domain=amazon.com&skip_gtin_cache=true`;
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Rainforest API error (${response.status}): ${body}`);
  }
  return response.json();
}

export async function searchProducts(query: string): Promise<any> {
  const apiKey = getApiKey();
  const url = `${RAINFOREST_BASE_URL}?api_key=${encodeURIComponent(apiKey)}&type=search&search_term=${encodeURIComponent(query)}&amazon_domain=amazon.com`;
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Rainforest API error (${response.status}): ${body}`);
  }
  return response.json();
}

function estimateFbaFee(weightLbs: number): number {
  if (weightLbs <= 0.5) return 3.22;
  if (weightLbs <= 1) return 3.86;
  if (weightLbs <= 2) return 5.32;
  if (weightLbs <= 3) return 5.77;
  if (weightLbs <= 5) return 6.75;
  if (weightLbs <= 10) return 7.82;
  return 8.90 + (weightLbs - 10) * 0.38;
}

function estimateStorageFee(dimensions: string): number {
  const match = dimensions.match(/([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)/i);
  if (!match) return 0.75;
  const l = parseFloat(match[1]);
  const w = parseFloat(match[2]);
  const h = parseFloat(match[3]);
  const cubicFeet = (l * w * h) / 1728;
  return Math.round(cubicFeet * 0.75 * 100) / 100;
}

function estimateMonthlySales(rank: number, category: string): number {
  if (rank <= 0) return 0;
  const categoryMultipliers: Record<string, number> = {
    "Electronics": 1.2,
    "Video Games": 1.5,
    "Cell Phones & Accessories": 1.0,
    "Tools & Home Improvement": 0.8,
    "Toys & Games": 1.3,
    "Home & Kitchen": 1.1,
    "Sports & Outdoors": 0.9,
    "Health & Household": 1.0,
    "Beauty & Personal Care": 1.1,
    "Grocery & Gourmet Food": 1.2,
  };
  const multiplier = categoryMultipliers[category] || 1.0;
  const dailySales = Math.max(1, Math.round((500000 / Math.pow(rank, 0.8)) * multiplier));
  return dailySales * 30;
}

function buildAlerts(product: any): Alert[] {
  const alerts: Alert[] = [];
  const title = (product.title || "").toLowerCase();
  const category = (product.categories_flat || "").toLowerCase();

  const weightLbs = product.weight ? parseFloat(product.weight) : 0;
  const dimensions = product.dimensions || "";
  const dimMatch = dimensions.match(/([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)/i);
  let isOversized = false;
  if (dimMatch) {
    const maxDim = Math.max(parseFloat(dimMatch[1]), parseFloat(dimMatch[2]), parseFloat(dimMatch[3]));
    isOversized = maxDim > 18 || weightLbs > 20;
  }

  if (isOversized) {
    alerts.push({ type: "oversized", severity: "warning", message: "Oversized item. Higher FBA fees apply." });
  }

  if (title.includes("battery") || title.includes("lithium") || category.includes("hazardous")) {
    alerts.push({ type: "hazmat", severity: "danger", message: "Potential hazmat item. Review required before selling." });
  }

  if (title.includes("meltable") || category.includes("chocolate") || category.includes("candy")) {
    alerts.push({ type: "meltable", severity: "warning", message: "Meltable item. Seasonal FBA restrictions may apply." });
  }

  return alerts;
}

export function transformProductResponse(data: any): ProductData {
  const product = data.product || {};
  const buyBox = product.buybox_winner || {};
  const categories = product.categories || [];
  const mainCategory = categories[0] || {};
  const subCategory = categories.length > 1 ? categories[categories.length - 1] : {};
  const bsrList = product.bestsellers_rank || [];
  const mainBsr = bsrList[0] || {};
  const subBsr = bsrList.length > 1 ? bsrList[bsrList.length - 1] : {};

  const price = buyBox.price?.value || product.buybox_winner?.price?.value || 0;
  const weightStr = product.weight || "";
  const weightLbs = parseFloat(weightStr) || 0;
  const dimensionsStr = product.dimensions || "";

  const dimMatch = dimensionsStr.match(/([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)/i);
  let isOversized = false;
  if (dimMatch) {
    const maxDim = Math.max(parseFloat(dimMatch[1]), parseFloat(dimMatch[2]), parseFloat(dimMatch[3]));
    isOversized = maxDim > 18 || weightLbs > 20;
  }

  const referralFee = Math.round(price * 0.15 * 100) / 100;
  const fbaFees = estimateFbaFee(weightLbs);
  const storageFee = estimateStorageFee(dimensionsStr);
  const totalFees = Math.round((referralFee + fbaFees + storageFee) * 100) / 100;

  const categoryName = mainCategory.name || "Unknown";
  const bsrRank = mainBsr.rank || 0;
  const estimatedMonthlySales = estimateMonthlySales(bsrRank, categoryName);

  const offers = data.offers || [];
  const competitors: Competitor[] = offers.slice(0, 10).map((offer: any) => ({
    name: offer.seller?.name || "Unknown Seller",
    price: offer.price?.value || 0,
    shipping: offer.delivery?.price?.value || 0,
    isFBA: offer.fulfillment?.type === "FBA" || offer.fulfillment?.is_fulfilled_by_amazon === true,
    rating: offer.seller?.rating || 0,
    stockEstimate: offer.availability?.stock_level || 0,
    isBuyBox: offer.is_buybox_winner || false,
  }));

  let fbaSellerCount = 0;
  let fbmSellerCount = 0;
  for (const c of competitors) {
    if (c.isFBA) fbaSellerCount++;
    else fbmSellerCount++;
  }

  const images = (product.images || []).map((img: any) => img.link || img).filter(Boolean);

  const alerts = buildAlerts(product);

  return {
    asin: product.asin || "",
    upc: product.upc || product.ean || "",
    title: product.title || "",
    brand: product.brand || "",
    category: categoryName,
    categoryRank: bsrRank,
    subcategory: subCategory.name || "",
    subcategoryRank: subBsr.rank || 0,
    imageUrl: product.main_image?.link || (images.length > 0 ? images[0] : ""),
    images,
    rating: product.rating || 0,
    reviewCount: product.ratings_total || 0,
    currentPrice: price,
    lowestNewPrice: product.lowest_price?.value || price,
    amazonPrice: product.amazon_price?.value ?? null,
    buyBoxPrice: price,
    buyBoxSeller: buyBox.seller?.name || "Unknown",
    buyBoxIsFBA: buyBox.fulfillment?.type === "FBA" || buyBox.fulfillment?.is_fulfilled_by_amazon === true,
    fbaFees,
    referralFee,
    storageFee,
    totalFees,
    weight: weightLbs,
    dimensions: dimensionsStr,
    isOversized,
    isHazmat: alerts.some((a) => a.type === "hazmat"),
    isRestricted: false,
    hasIPComplaints: false,
    isGated: false,
    estimatedMonthlySales,
    competitorCount: competitors.length || parseInt(product.sellers_count) || 0,
    fbaSellerCount,
    fbmSellerCount,
    priceHistory: [],
    rankHistory: [],
    competitors,
    alerts,
  };
}

export function transformSearchResults(data: any): ProductData[] {
  const results = data.search_results || [];
  return results.slice(0, 20).map((item: any) => {
    const price = item.price?.value || 0;
    const rating = item.rating || 0;
    const reviewCount = item.ratings_total || 0;

    const referralFee = Math.round(price * 0.15 * 100) / 100;
    const fbaFees = 4.50;
    const storageFee = 0.50;
    const totalFees = Math.round((referralFee + fbaFees + storageFee) * 100) / 100;

    return {
      asin: item.asin || "",
      upc: "",
      title: item.title || "",
      brand: item.brand || "",
      category: item.categories?.[0]?.name || "",
      categoryRank: item.bestsellers_rank?.[0]?.rank || 0,
      subcategory: "",
      subcategoryRank: 0,
      imageUrl: item.image || "",
      images: item.image ? [item.image] : [],
      rating,
      reviewCount,
      currentPrice: price,
      lowestNewPrice: price,
      amazonPrice: item.is_amazon_choice ? price : null,
      buyBoxPrice: price,
      buyBoxSeller: "Unknown",
      buyBoxIsFBA: false,
      fbaFees,
      referralFee,
      storageFee,
      totalFees,
      weight: 0,
      dimensions: "",
      isOversized: false,
      isHazmat: false,
      isRestricted: false,
      hasIPComplaints: false,
      isGated: false,
      estimatedMonthlySales: 0,
      competitorCount: 0,
      fbaSellerCount: 0,
      fbmSellerCount: 0,
      priceHistory: [],
      rankHistory: [],
      competitors: [],
      alerts: [],
    } as ProductData;
  });
}
