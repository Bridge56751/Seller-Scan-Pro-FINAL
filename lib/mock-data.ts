export interface ProductData {
  asin: string;
  upc: string;
  title: string;
  brand: string;
  category: string;
  categoryRank: number;
  subcategory: string;
  subcategoryRank: number;
  imageUrl: string;
  images: string[];
  rating: number;
  reviewCount: number;
  currentPrice: number;
  lowestNewPrice: number;
  amazonPrice: number | null;
  buyBoxPrice: number;
  buyBoxSeller: string;
  buyBoxIsFBA: boolean;
  fbaFees: number;
  referralFee: number;
  storageFee: number;
  totalFees: number;
  weight: number;
  dimensions: string;
  isOversized: boolean;
  isHazmat: boolean;
  isRestricted: boolean;
  hasIPComplaints: boolean;
  isGated: boolean;
  estimatedMonthlySales: number;
  competitorCount: number;
  newOfferCount: number;
  usedOfferCount: number;
  fbaSellerCount: number;
  fbmSellerCount: number;
  priceHistory: PricePoint[];
  rankHistory: RankPoint[];
  competitors: Competitor[];
  alerts: Alert[];
}

export interface PricePoint {
  date: string;
  amazon: number | null;
  newPrice: number;
  usedPrice: number | null;
  buyBox: number;
}

export interface RankPoint {
  date: string;
  rank: number;
}

export interface Competitor {
  name: string;
  price: number;
  shipping: number;
  isFBA: boolean;
  rating: number;
  stockEstimate: number;
  isBuyBox: boolean;
}

export interface Alert {
  type: "hazmat" | "oversized" | "ip_complaint" | "gated" | "restricted" | "meltable" | "fragile";
  severity: "danger" | "warning" | "info";
  message: string;
}

export interface ScanHistoryItem {
  id: string;
  asin: string;
  upc: string;
  title: string;
  imageUrl: string;
  price: number;
  profit: number;
  roi: number;
  bsr: number;
  timestamp: number;
}

const MOCK_PRODUCTS: Record<string, ProductData> = {
  "B0CXLR7LKY": {
    asin: "B0CXLR7LKY",
    upc: "194253942818",
    title: "Apple AirPods Pro 2nd Generation with MagSafe Charging Case (USB-C)",
    brand: "Apple",
    category: "Electronics",
    categoryRank: 1842,
    subcategory: "Headphones",
    subcategoryRank: 23,
    imageUrl: "https://m.media-amazon.com/images/I/61f1YfTkTDL._AC_SL1500_.jpg",
    images: [],
    rating: 4.7,
    reviewCount: 89432,
    currentPrice: 189.99,
    lowestNewPrice: 179.99,
    amazonPrice: 189.99,
    buyBoxPrice: 189.99,
    buyBoxSeller: "Amazon.com",
    buyBoxIsFBA: true,
    fbaFees: 6.84,
    referralFee: 14.25,
    storageFee: 0.42,
    totalFees: 21.51,
    weight: 0.34,
    dimensions: "3.07 x 2.39 x 0.94 inches",
    isOversized: false,
    isHazmat: false,
    isRestricted: false,
    hasIPComplaints: false,
    isGated: false,
    estimatedMonthlySales: 45200,
    competitorCount: 28,
    newOfferCount: 28,
    usedOfferCount: 0,
    fbaSellerCount: 12,
    fbmSellerCount: 16,
    priceHistory: generatePriceHistory(189.99, 249.99, 90),
    rankHistory: generateRankHistory(1842, 90),
    competitors: [
      { name: "Amazon.com", price: 189.99, shipping: 0, isFBA: true, rating: 4.9, stockEstimate: 999, isBuyBox: true },
      { name: "TechDeals Pro", price: 194.99, shipping: 0, isFBA: true, rating: 4.7, stockEstimate: 45, isBuyBox: false },
      { name: "GadgetWorld", price: 192.50, shipping: 0, isFBA: true, rating: 4.5, stockEstimate: 22, isBuyBox: false },
      { name: "ElectroMart", price: 199.99, shipping: 4.99, isFBA: false, rating: 4.3, stockEstimate: 8, isBuyBox: false },
      { name: "BestBuys Online", price: 195.00, shipping: 0, isFBA: true, rating: 4.6, stockEstimate: 31, isBuyBox: false },
    ],
    alerts: [],
  },
  "B09V3KXJPB": {
    asin: "B09V3KXJPB",
    upc: "889842758115",
    title: "PlayStation DualSense Wireless Controller - Midnight Black",
    brand: "Sony",
    category: "Video Games",
    categoryRank: 342,
    subcategory: "Controllers",
    subcategoryRank: 5,
    imageUrl: "https://m.media-amazon.com/images/I/61kk1l+BQUL._SL1500_.jpg",
    images: [],
    rating: 4.8,
    reviewCount: 124891,
    currentPrice: 54.99,
    lowestNewPrice: 49.99,
    amazonPrice: 54.99,
    buyBoxPrice: 54.99,
    buyBoxSeller: "Amazon.com",
    buyBoxIsFBA: true,
    fbaFees: 5.12,
    referralFee: 4.40,
    storageFee: 0.38,
    totalFees: 9.90,
    weight: 0.55,
    dimensions: "6.3 x 2.6 x 4.0 inches",
    isOversized: false,
    isHazmat: false,
    isRestricted: false,
    hasIPComplaints: false,
    isGated: false,
    estimatedMonthlySales: 32100,
    competitorCount: 45,
    newOfferCount: 40,
    usedOfferCount: 5,
    fbaSellerCount: 18,
    fbmSellerCount: 27,
    priceHistory: generatePriceHistory(54.99, 69.99, 90),
    rankHistory: generateRankHistory(342, 90),
    competitors: [
      { name: "Amazon.com", price: 54.99, shipping: 0, isFBA: true, rating: 4.9, stockEstimate: 999, isBuyBox: true },
      { name: "GameStop Direct", price: 59.99, shipping: 0, isFBA: true, rating: 4.4, stockEstimate: 67, isBuyBox: false },
      { name: "PlayZone", price: 56.99, shipping: 3.99, isFBA: false, rating: 4.2, stockEstimate: 12, isBuyBox: false },
    ],
    alerts: [],
  },
  "B0CHX3QBCH": {
    asin: "B0CHX3QBCH",
    upc: "194253715306",
    title: "Apple iPhone 15 Pro Max Silicone Case with MagSafe - Black",
    brand: "Apple",
    category: "Cell Phones & Accessories",
    categoryRank: 8921,
    subcategory: "Cases",
    subcategoryRank: 156,
    imageUrl: "https://m.media-amazon.com/images/I/61YBLrwEzqL._AC_SL1500_.jpg",
    images: [],
    rating: 4.5,
    reviewCount: 3842,
    currentPrice: 42.99,
    lowestNewPrice: 38.99,
    amazonPrice: 42.99,
    buyBoxPrice: 42.99,
    buyBoxSeller: "Amazon.com",
    buyBoxIsFBA: true,
    fbaFees: 3.86,
    referralFee: 6.45,
    storageFee: 0.18,
    totalFees: 10.49,
    weight: 0.12,
    dimensions: "6.7 x 3.5 x 0.5 inches",
    isOversized: false,
    isHazmat: false,
    isRestricted: false,
    hasIPComplaints: true,
    isGated: false,
    estimatedMonthlySales: 4200,
    competitorCount: 15,
    newOfferCount: 12,
    usedOfferCount: 3,
    fbaSellerCount: 6,
    fbmSellerCount: 9,
    priceHistory: generatePriceHistory(42.99, 49.99, 90),
    rankHistory: generateRankHistory(8921, 90),
    competitors: [
      { name: "Amazon.com", price: 42.99, shipping: 0, isFBA: true, rating: 4.9, stockEstimate: 999, isBuyBox: true },
      { name: "CaseWorld", price: 44.99, shipping: 0, isFBA: true, rating: 4.3, stockEstimate: 24, isBuyBox: false },
    ],
    alerts: [
      { type: "ip_complaint", severity: "warning", message: "IP complaints reported on this listing. Exercise caution." },
    ],
  },
  "B0D7C56X19": {
    asin: "B0D7C56X19",
    upc: "045242724109",
    title: "Milwaukee M18 FUEL 1/2 in. Hammer Drill/Driver Kit with Battery",
    brand: "Milwaukee",
    category: "Tools & Home Improvement",
    categoryRank: 2456,
    subcategory: "Power Drills",
    subcategoryRank: 12,
    imageUrl: "https://m.media-amazon.com/images/I/71TbXHCjRjL._AC_SL1500_.jpg",
    images: [],
    rating: 4.9,
    reviewCount: 12453,
    currentPrice: 299.00,
    lowestNewPrice: 279.00,
    amazonPrice: 299.00,
    buyBoxPrice: 279.00,
    buyBoxSeller: "ToolDirect",
    buyBoxIsFBA: true,
    fbaFees: 12.42,
    referralFee: 41.86,
    storageFee: 1.24,
    totalFees: 55.52,
    weight: 8.2,
    dimensions: "15.2 x 12.1 x 5.8 inches",
    isOversized: true,
    isHazmat: true,
    isRestricted: false,
    hasIPComplaints: false,
    isGated: true,
    estimatedMonthlySales: 6800,
    competitorCount: 8,
    newOfferCount: 6,
    usedOfferCount: 2,
    fbaSellerCount: 4,
    fbmSellerCount: 4,
    priceHistory: generatePriceHistory(279.00, 349.00, 90),
    rankHistory: generateRankHistory(2456, 90),
    competitors: [
      { name: "ToolDirect", price: 279.00, shipping: 0, isFBA: true, rating: 4.8, stockEstimate: 42, isBuyBox: true },
      { name: "Amazon.com", price: 299.00, shipping: 0, isFBA: true, rating: 4.9, stockEstimate: 999, isBuyBox: false },
      { name: "ProToolsHub", price: 289.99, shipping: 0, isFBA: true, rating: 4.5, stockEstimate: 15, isBuyBox: false },
    ],
    alerts: [
      { type: "oversized", severity: "warning", message: "Oversized item. Higher FBA fees apply." },
      { type: "hazmat", severity: "danger", message: "Contains lithium battery. Hazmat review required." },
      { type: "gated", severity: "danger", message: "Category is gated. Approval required to sell." },
    ],
  },
};

function generatePriceHistory(basePrice: number, maxPrice: number, days: number): PricePoint[] {
  const points: PricePoint[] = [];
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 86400000).toISOString().split("T")[0];
    const variation = (Math.random() - 0.5) * (maxPrice - basePrice) * 0.4;
    const amazonVar = Math.random() > 0.1 ? basePrice + variation * 0.3 : null;
    const newPrice = basePrice + variation * 0.5 - (maxPrice - basePrice) * 0.1;
    const buyBox = basePrice + variation * 0.2;
    points.push({
      date,
      amazon: amazonVar ? Math.round(amazonVar * 100) / 100 : null,
      newPrice: Math.round(Math.max(newPrice, basePrice * 0.85) * 100) / 100,
      usedPrice: Math.random() > 0.3 ? Math.round((basePrice * 0.7 + variation * 0.2) * 100) / 100 : null,
      buyBox: Math.round(Math.max(buyBox, basePrice * 0.9) * 100) / 100,
    });
  }
  return points;
}

function generateRankHistory(baseRank: number, days: number): RankPoint[] {
  const points: RankPoint[] = [];
  const now = Date.now();
  let currentRank = baseRank;
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 86400000).toISOString().split("T")[0];
    currentRank = Math.max(1, currentRank + Math.round((Math.random() - 0.48) * baseRank * 0.15));
    points.push({ date, rank: currentRank });
  }
  return points;
}

const UPC_TO_ASIN: Record<string, string> = {
  "194253942818": "B0CXLR7LKY",
  "889842758115": "B09V3KXJPB",
  "194253715306": "B0CHX3QBCH",
  "045242724109": "B0D7C56X19",
};

export function lookupByBarcode(barcode: string): ProductData | null {
  const asin = UPC_TO_ASIN[barcode];
  if (asin) return MOCK_PRODUCTS[asin] || null;
  return null;
}

export function lookupByAsin(asin: string): ProductData | null {
  return MOCK_PRODUCTS[asin.toUpperCase()] || null;
}

export function searchProducts(query: string): ProductData[] {
  const q = query.toLowerCase();
  return Object.values(MOCK_PRODUCTS).filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.asin.toLowerCase().includes(q) ||
      p.upc.includes(q)
  );
}

export function calculateProfit(product: ProductData, costPrice: number): {
  profit: number;
  roi: number;
  margin: number;
  maxCost: number;
  breakeven: number;
} {
  const salePrice = product.buyBoxPrice;
  const profit = salePrice - costPrice - product.totalFees;
  const roi = costPrice > 0 ? (profit / costPrice) * 100 : 0;
  const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
  const maxCost = salePrice - product.totalFees;
  const breakeven = product.totalFees;
  return {
    profit: Math.round(profit * 100) / 100,
    roi: Math.round(roi * 10) / 10,
    margin: Math.round(margin * 10) / 10,
    maxCost: Math.round(maxCost * 100) / 100,
    breakeven: Math.round(breakeven * 100) / 100,
  };
}

export function formatBSR(rank: number): string {
  if (rank >= 1000000) return (rank / 1000000).toFixed(1) + "M";
  if (rank >= 1000) return (rank / 1000).toFixed(1) + "K";
  return rank.toString();
}

export function formatCurrency(amount: number): string {
  return "$" + Math.abs(amount).toFixed(2);
}

export function estimateSalesPerDay(rank: number, category: string): number {
  const categoryMultipliers: Record<string, number> = {
    "Electronics": 1.2,
    "Video Games": 1.5,
    "Cell Phones & Accessories": 1.0,
    "Tools & Home Improvement": 0.8,
  };
  const multiplier = categoryMultipliers[category] || 1.0;
  if (rank <= 100) return Math.round(300 * multiplier);
  if (rank <= 500) return Math.round(100 * multiplier);
  if (rank <= 1000) return Math.round(50 * multiplier);
  if (rank <= 5000) return Math.round(20 * multiplier);
  if (rank <= 10000) return Math.round(10 * multiplier);
  if (rank <= 50000) return Math.round(5 * multiplier);
  return Math.round(2 * multiplier);
}
