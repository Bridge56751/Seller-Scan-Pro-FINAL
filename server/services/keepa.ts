import type { ProductData, PricePoint, RankPoint, Competitor, Alert } from "../../lib/mock-data";

const KEEPA_BASE_URL = "https://api.keepa.com";
const KEEPA_EPOCH = 21564000;

function getApiKey(): string {
  const key = process.env.KEEPA_API_KEY;
  if (!key) {
    throw new Error("KEEPA_API_KEY environment variable is not set");
  }
  return key;
}

function keepaTimeToDateString(keepaMinutes: number): string {
  const unixMs = (keepaMinutes + KEEPA_EPOCH) * 60000;
  return new Date(unixMs).toISOString().split("T")[0];
}

function keepaPriceToDollars(cents: number): number | null {
  if (cents < 0) return null;
  return Math.round(cents) / 100;
}

function keepaImageUrl(hash: string): string {
  return `https://images-na.ssl-images-amazon.com/images/I/${hash}`;
}

export interface KeepaFullProduct {
  product: ProductData;
  priceHistory: PricePoint[];
  rankHistory: RankPoint[];
  tokensLeft: number;
  refillRate: number;
}

export interface KeepaChartData {
  priceHistory: PricePoint[];
  rankHistory: RankPoint[];
  tokensLeft: number;
  refillRate: number;
}

export async function fetchKeepaProductFull(asin: string): Promise<KeepaFullProduct | null> {
  const apiKey = getApiKey();
  const url = `${KEEPA_BASE_URL}/product?key=${encodeURIComponent(apiKey)}&domain=1&asin=${encodeURIComponent(asin)}&history=1&days=180&stats=180&rating=1&buybox=1`;

  console.log(`[Keepa] Fetching full product data for ASIN: ${asin}`);
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    console.error(`Keepa API error (${response.status}): ${body}`);
    throw new Error(`Keepa API error (${response.status})`);
  }

  const data = await response.json();
  const tokensLeft = data.tokensLeft || 0;
  const refillRate = data.refillRate || 0;
  console.log(`[Keepa] Tokens remaining: ${tokensLeft}, Refill rate: ${refillRate}/min`);

  if (!data.products || data.products.length === 0) {
    return null;
  }

  const kp = data.products[0];
  const product = transformKeepaProduct(kp);
  const { priceHistory, rankHistory } = extractChartData(kp);

  return { product, priceHistory, rankHistory, tokensLeft, refillRate };
}

export async function fetchKeepaProductByCode(code: string): Promise<KeepaFullProduct | null> {
  const apiKey = getApiKey();
  const url = `${KEEPA_BASE_URL}/product?key=${encodeURIComponent(apiKey)}&domain=1&code=${encodeURIComponent(code)}&history=1&days=180&stats=180&rating=1&buybox=1`;

  console.log(`[Keepa] Fetching product by UPC/EAN: ${code}`);
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    console.error(`Keepa API error (${response.status}): ${body}`);
    throw new Error(`Keepa API error (${response.status})`);
  }

  const data = await response.json();
  const tokensLeft = data.tokensLeft || 0;
  const refillRate = data.refillRate || 0;
  console.log(`[Keepa] Tokens remaining: ${tokensLeft}, Refill rate: ${refillRate}/min`);

  if (!data.products || data.products.length === 0) {
    return null;
  }

  const kp = data.products[0];
  const product = transformKeepaProduct(kp);
  const { priceHistory, rankHistory } = extractChartData(kp);

  return { product, priceHistory, rankHistory, tokensLeft, refillRate };
}

export interface KeepaOffersResult {
  competitors: Competitor[];
  fbaSellerCount: number;
  fbmSellerCount: number;
  tokensLeft: number;
}

export async function fetchKeepaOffers(asin: string): Promise<KeepaOffersResult> {
  const apiKey = getApiKey();
  const url = `${KEEPA_BASE_URL}/product?key=${encodeURIComponent(apiKey)}&domain=1&asin=${encodeURIComponent(asin)}&offers=20&history=1&days=1&stats=1`;

  console.log(`[Keepa] Fetching offers for ASIN: ${asin} (2 tokens)`);
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    console.error(`Keepa offers error (${response.status}): ${body}`);
    throw new Error(`Keepa offers error (${response.status})`);
  }

  const data = await response.json();
  const tokensLeft = data.tokensLeft || 0;
  console.log(`[Keepa] Offers fetched, tokens remaining: ${tokensLeft}`);

  if (!data.products || data.products.length === 0) {
    return { competitors: [], fbaSellerCount: 0, fbmSellerCount: 0, tokensLeft };
  }

  const kp = data.products[0];
  const competitors = buildCompetitors(kp);
  let fbaSellerCount = 0;
  let fbmSellerCount = 0;
  for (const c of competitors) {
    if (c.isFBA) fbaSellerCount++;
    else fbmSellerCount++;
  }

  return { competitors, fbaSellerCount, fbmSellerCount, tokensLeft };
}

export async function searchKeepaProducts(term: string): Promise<{ products: ProductData[]; tokensLeft: number }> {
  const apiKey = getApiKey();
  const url = `${KEEPA_BASE_URL}/search?key=${encodeURIComponent(apiKey)}&domain=1&type=product&term=${encodeURIComponent(term)}&stats=180`;

  console.log(`[Keepa] Searching products: "${term}"`);
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    console.error(`Keepa search error (${response.status}): ${body}`);
    throw new Error(`Keepa search error (${response.status})`);
  }

  const data = await response.json();
  const tokensLeft = data.tokensLeft || 0;
  console.log(`[Keepa] Search returned ${data.products?.length || 0} results, tokens: ${tokensLeft}`);

  if (!data.products || data.products.length === 0) {
    return { products: [], tokensLeft };
  }

  const products = data.products.slice(0, 20).map((kp: any) => transformKeepaProduct(kp));
  return { products, tokensLeft };
}

export async function getKeepaTokenStatus(): Promise<{ tokensLeft: number; refillRate: number }> {
  const apiKey = getApiKey();
  const url = `${KEEPA_BASE_URL}/token?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Keepa token status error: ${response.status}`);
  }
  const data = await response.json();
  return { tokensLeft: data.tokensLeft || 0, refillRate: data.refillRate || 0 };
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

function estimateStorageFee(lengthIn: number, widthIn: number, heightIn: number): number {
  if (lengthIn <= 0 || widthIn <= 0 || heightIn <= 0) return 0.75;
  const cubicFeet = (lengthIn * widthIn * heightIn) / 1728;
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

function buildAlerts(kp: any, weightLbs: number, dimInches: { l: number; w: number; h: number }): Alert[] {
  const alerts: Alert[] = [];
  const title = (kp.title || "").toLowerCase();
  const categoryName = getCategoryName(kp).toLowerCase();

  const maxDim = Math.max(dimInches.l, dimInches.w, dimInches.h);
  const isOversized = maxDim > 18 || weightLbs > 20;

  if (isOversized) {
    alerts.push({ type: "oversized", severity: "warning", message: "Oversized item. Higher FBA fees apply." });
  }

  if (title.includes("battery") || title.includes("lithium") || categoryName.includes("hazardous")) {
    alerts.push({ type: "hazmat", severity: "danger", message: "Potential hazmat item. Review required before selling." });
  }

  if (title.includes("meltable") || categoryName.includes("chocolate") || categoryName.includes("candy")) {
    alerts.push({ type: "meltable", severity: "warning", message: "Meltable item. Seasonal FBA restrictions may apply." });
  }

  return alerts;
}

function getCategoryName(kp: any): string {
  if (kp.categoryTree && kp.categoryTree.length > 0) {
    return kp.categoryTree[0].name || "Unknown";
  }
  return "Unknown";
}

function getSubcategoryName(kp: any): string {
  if (kp.categoryTree && kp.categoryTree.length > 1) {
    return kp.categoryTree[kp.categoryTree.length - 1].name || "";
  }
  return "";
}

function transformKeepaProduct(kp: any): ProductData {
  const stats = kp.stats || {};
  const current = stats.current || [];

  const amazonPriceCents = current[0] ?? -1;
  const newPriceCents = current[1] ?? -1;
  const salesRank = current[3] ?? -1;
  const fbaPriceCents = current[10] ?? -1;
  const newOfferCount = current[11] ?? 0;
  const usedOfferCount = current[12] ?? 0;
  const ratingRaw = current[16] ?? -1;
  const reviewCount = current[17] ?? 0;
  const buyBoxCents = current[18] ?? -1;

  const amazonPrice = keepaPriceToDollars(amazonPriceCents);
  const newPrice = keepaPriceToDollars(newPriceCents);
  const fbaPrice = keepaPriceToDollars(fbaPriceCents);
  const buyBoxPrice = keepaPriceToDollars(buyBoxCents);
  const rating = ratingRaw >= 0 ? ratingRaw / 10 : 0;

  const currentPrice = buyBoxPrice || newPrice || amazonPrice || fbaPrice || 0;
  const lowestNew = fbaPrice || newPrice || currentPrice;

  const weightGrams = kp.packageWeight || 0;
  const weightLbs = weightGrams > 0 ? Math.round((weightGrams / 453.592) * 100) / 100 : 0;

  const heightMm = kp.packageHeight || 0;
  const widthMm = kp.packageWidth || 0;
  const lengthMm = kp.packageLength || 0;
  const dimInches = {
    l: Math.round((lengthMm / 25.4) * 10) / 10,
    w: Math.round((widthMm / 25.4) * 10) / 10,
    h: Math.round((heightMm / 25.4) * 10) / 10,
  };
  const dimensionsStr = dimInches.l > 0 ? `${dimInches.l} x ${dimInches.w} x ${dimInches.h} inches` : "";
  const maxDim = Math.max(dimInches.l, dimInches.w, dimInches.h);
  const isOversized = maxDim > 18 || weightLbs > 20;

  const referralFeePercent = (kp.referralFeePercent || 15);
  const referralFee = Math.round(currentPrice * (referralFeePercent / 100) * 100) / 100;
  const fbaFees = estimateFbaFee(weightLbs);
  const storageFee = estimateStorageFee(dimInches.l, dimInches.w, dimInches.h);
  const totalFees = Math.round((referralFee + fbaFees + storageFee) * 100) / 100;

  const categoryName = getCategoryName(kp);
  const bsrRank = salesRank >= 0 ? salesRank : getBsrFromSalesRanks(kp);
  const estimatedMonthlySales = estimateMonthlySales(bsrRank, categoryName);

  const images: string[] = [];
  if (kp.imagesCSV) {
    const hashes = kp.imagesCSV.split(",");
    for (const hash of hashes) {
      if (hash.trim()) {
        images.push(keepaImageUrl(hash.trim()));
      }
    }
  }

  const competitors = buildCompetitors(kp);
  let fbaSellerCount = 0;
  let fbmSellerCount = 0;
  for (const c of competitors) {
    if (c.isFBA) fbaSellerCount++;
    else fbmSellerCount++;
  }

  const alerts = buildAlerts(kp, weightLbs, dimInches);

  const upc = (kp.upcList && kp.upcList.length > 0) ? kp.upcList[0] :
              (kp.eanList && kp.eanList.length > 0) ? kp.eanList[0] : "";

  const buyBoxSeller = getBuyBoxSeller(kp);

  const subcategoryName = getSubcategoryName(kp);
  const subRank = getSubcategoryRank(kp);

  return {
    asin: kp.asin || "",
    upc,
    title: kp.title || "",
    brand: kp.brand || kp.manufacturer || "",
    category: categoryName,
    categoryRank: bsrRank,
    subcategory: subcategoryName,
    subcategoryRank: subRank,
    imageUrl: images.length > 0 ? images[0] : "",
    images,
    rating,
    reviewCount: reviewCount >= 0 ? reviewCount : 0,
    currentPrice,
    lowestNewPrice: lowestNew || currentPrice,
    amazonPrice,
    buyBoxPrice: currentPrice,
    buyBoxSeller,
    buyBoxIsFBA: isBuyBoxFBA(kp),
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
    competitorCount: (newOfferCount >= 0 ? newOfferCount : 0) + (usedOfferCount >= 0 ? usedOfferCount : 0),
    newOfferCount: newOfferCount >= 0 ? newOfferCount : 0,
    usedOfferCount: usedOfferCount >= 0 ? usedOfferCount : 0,
    fbaSellerCount,
    fbmSellerCount,
    priceHistory: [],
    rankHistory: [],
    competitors,
    alerts,
  };
}

function getBsrFromSalesRanks(kp: any): number {
  if (kp.salesRanks) {
    const categories = Object.keys(kp.salesRanks);
    if (categories.length > 0) {
      const ranks = kp.salesRanks[categories[0]];
      if (Array.isArray(ranks) && ranks.length >= 2) {
        return ranks[ranks.length - 1];
      }
    }
  }
  return 0;
}

function getSubcategoryRank(kp: any): number {
  if (kp.salesRanks) {
    const categories = Object.keys(kp.salesRanks);
    if (categories.length > 1) {
      const ranks = kp.salesRanks[categories[categories.length - 1]];
      if (Array.isArray(ranks) && ranks.length >= 2) {
        return ranks[ranks.length - 1];
      }
    }
  }
  return 0;
}

function getBuyBoxSeller(kp: any): string {
  if (kp.buyBoxSellerIdHistory && kp.buyBoxSellerIdHistory.length >= 2) {
    const lastSellerId = kp.buyBoxSellerIdHistory[kp.buyBoxSellerIdHistory.length - 1];
    if (lastSellerId === "ATVPDKIKX0DER" || lastSellerId === "Amazon") return "Amazon.com";
    return lastSellerId || "Unknown";
  }
  return "Unknown";
}

function isBuyBoxFBA(kp: any): boolean {
  if (kp.offers && kp.offers.length > 0) {
    for (const offer of kp.offers) {
      if (offer.isBuyBoxWinner) return offer.isFBA === true;
    }
  }
  return true;
}

function buildCompetitors(kp: any): Competitor[] {
  if (!kp.offers || !Array.isArray(kp.offers)) return [];

  const liveOrder = kp.liveOffersOrder || [];
  const competitors: Competitor[] = [];

  const orderedIndices = liveOrder.length > 0 ? liveOrder : kp.offers.map((_: any, i: number) => i);

  for (const idx of orderedIndices) {
    const offer = kp.offers[idx];
    if (!offer || offer.condition !== 1) continue;

    const priceCents = getOfferCurrentPrice(offer);
    const price = priceCents > 0 ? priceCents / 100 : 0;
    if (price <= 0) continue;

    const shippingCents = getOfferShipping(offer);
    const shipping = shippingCents > 0 ? shippingCents / 100 : 0;

    const sellerId = offer.sellerId || "";
    const sellerName = sellerId === "ATVPDKIKX0DER" ? "Amazon.com" : (offer.sellerName || sellerId || "Unknown Seller");

    competitors.push({
      name: sellerName,
      price,
      shipping,
      isFBA: offer.isFBA === true,
      rating: offer.sellerRating ? offer.sellerRating / 10 : 0,
      stockEstimate: offer.stockCSV ? getLatestStock(offer.stockCSV) : 0,
      isBuyBox: offer.isBuyBoxWinner === true,
    });

    if (competitors.length >= 10) break;
  }

  return competitors;
}

function getOfferCurrentPrice(offer: any): number {
  if (offer.offerCSV && Array.isArray(offer.offerCSV) && offer.offerCSV.length >= 2) {
    return offer.offerCSV[offer.offerCSV.length - 1];
  }
  return -1;
}

function getOfferShipping(offer: any): number {
  if (offer.shippingCSV && Array.isArray(offer.shippingCSV) && offer.shippingCSV.length >= 2) {
    return offer.shippingCSV[offer.shippingCSV.length - 1];
  }
  return 0;
}

function getLatestStock(stockCSV: any): number {
  if (Array.isArray(stockCSV) && stockCSV.length >= 2) {
    return stockCSV[stockCSV.length - 1] || 0;
  }
  return 0;
}

function extractChartData(kp: any): { priceHistory: PricePoint[]; rankHistory: RankPoint[] } {
  const csv = kp.csv || [];

  const amazonPriceCSV = csv[0] || [];
  const newPriceCSV = csv[1] || [];
  const usedPriceCSV = csv[2] || [];
  const salesRankCSV = csv[3] || [];
  const fbaPriceCSV = csv[10] || [];
  const buyBoxCSV = csv[18] || [];

  const rankHistory = parseSalesRankHistory(salesRankCSV);
  const priceHistory = buildPriceHistory(amazonPriceCSV, newPriceCSV, usedPriceCSV, buyBoxCSV, fbaPriceCSV);

  return { priceHistory, rankHistory };
}

function parseSalesRankHistory(csvArray: number[]): RankPoint[] {
  if (!csvArray || csvArray.length < 2) return [];

  const points: RankPoint[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < csvArray.length; i += 2) {
    const keepaTime = csvArray[i];
    const rank = csvArray[i + 1];
    if (keepaTime == null || rank == null || rank < 0) continue;

    const date = keepaTimeToDateString(keepaTime);
    if (seen.has(date)) continue;
    seen.add(date);

    points.push({ date, rank });
  }

  return points;
}

function buildPriceHistory(
  amazonCSV: number[],
  newCSV: number[],
  usedCSV: number[],
  buyBoxCSV: number[],
  fbaCSV: number[]
): PricePoint[] {
  const allDates = new Map<string, {
    amazon: number | null;
    newPrice: number;
    usedPrice: number | null;
    buyBox: number;
  }>();

  function processCSV(csvArray: number[], field: "amazon" | "newPrice" | "usedPrice" | "buyBox") {
    if (!csvArray || csvArray.length < 2) return;
    for (let i = 0; i < csvArray.length; i += 2) {
      const keepaTime = csvArray[i];
      const cents = csvArray[i + 1];
      if (keepaTime == null) continue;

      const date = keepaTimeToDateString(keepaTime);
      const price = keepaPriceToDollars(cents);

      if (!allDates.has(date)) {
        allDates.set(date, { amazon: null, newPrice: 0, usedPrice: null, buyBox: 0 });
      }
      const entry = allDates.get(date)!;
      (entry as any)[field] = price;
    }
  }

  processCSV(amazonCSV, "amazon");
  processCSV(buyBoxCSV.length > 0 ? buyBoxCSV : newCSV, "buyBox");
  processCSV(newCSV, "newPrice");
  processCSV(usedCSV, "usedPrice");

  if (fbaCSV && fbaCSV.length > 0) {
    for (let i = 0; i < fbaCSV.length; i += 2) {
      const keepaTime = fbaCSV[i];
      const cents = fbaCSV[i + 1];
      if (keepaTime == null) continue;

      const date = keepaTimeToDateString(keepaTime);
      const price = keepaPriceToDollars(cents);

      if (!allDates.has(date)) {
        allDates.set(date, { amazon: null, newPrice: 0, usedPrice: null, buyBox: 0 });
      }
      const entry = allDates.get(date)!;
      if (price !== null && (entry.newPrice === 0 || price < entry.newPrice)) {
        entry.newPrice = price;
      }
    }
  }

  const sorted = Array.from(allDates.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  let lastBuyBox = 0;
  let lastNew = 0;

  return sorted.map(([date, data]) => {
    if (data.buyBox && data.buyBox > 0) lastBuyBox = data.buyBox;
    if (data.newPrice && data.newPrice > 0) lastNew = data.newPrice;

    return {
      date,
      amazon: data.amazon,
      newPrice: data.newPrice > 0 ? data.newPrice : lastNew,
      usedPrice: data.usedPrice,
      buyBox: data.buyBox > 0 ? data.buyBox : lastBuyBox,
    };
  });
}
