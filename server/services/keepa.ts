import type { PricePoint, RankPoint } from "../../lib/mock-data";

const KEEPA_BASE_URL = "https://api.keepa.com";
const KEEPA_EPOCH = 21564000; // minutes from Unix epoch to Keepa epoch (2011-01-01)

function getApiKey(): string {
  const key = process.env.KEEPA_API_KEY;
  if (!key) {
    throw new Error("KEEPA_API_KEY environment variable is not set");
  }
  return key;
}

function keepaTimeToDate(keepaMinutes: number): Date {
  const unixMs = (keepaMinutes + KEEPA_EPOCH) * 60000;
  return new Date(unixMs);
}

function keepaTimeToDateString(keepaMinutes: number): string {
  return keepaTimeToDate(keepaMinutes).toISOString().split("T")[0];
}

function keepaPriceToDollars(cents: number): number | null {
  if (cents < 0) return null;
  return Math.round(cents) / 100;
}

export interface KeepaProductHistory {
  priceHistory: PricePoint[];
  rankHistory: RankPoint[];
  tokensLeft: number;
  refillRate: number;
}

export async function fetchKeepaProduct(asin: string): Promise<KeepaProductHistory | null> {
  const apiKey = getApiKey();
  const url = `${KEEPA_BASE_URL}/product?key=${encodeURIComponent(apiKey)}&domain=1&asin=${encodeURIComponent(asin)}&history=1&days=180&stats=180`;

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

  const product = data.products[0];
  const csv = product.csv || [];

  // csv[0] = AMAZON price history
  // csv[1] = NEW price history (marketplace new)
  // csv[2] = USED price history
  // csv[3] = SALES rank history
  // csv[7] = NEW, 3rd Party FBA price
  // csv[18] = BUY BOX price history

  const amazonPriceCSV = csv[0] || [];
  const newPriceCSV = csv[1] || [];
  const usedPriceCSV = csv[2] || [];
  const salesRankCSV = csv[3] || [];
  const fbaPriceCSV = csv[7] || [];
  const buyBoxCSV = csv[18] || [];

  const rankHistory = parseSalesRankHistory(salesRankCSV);
  const priceHistory = buildPriceHistory(amazonPriceCSV, newPriceCSV, usedPriceCSV, buyBoxCSV, fbaPriceCSV);

  return { priceHistory, rankHistory, tokensLeft, refillRate };
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
