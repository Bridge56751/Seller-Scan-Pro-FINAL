import type { ComparisonInput, ShoppingOffer, PhotoMatch } from "../../shared/shopping";
import { throwIfCanceled } from "../../shared/cancellation";

export class ShoppingError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export async function searchApi(params: Record<string, string>, options: { timeoutMs?: number; signal?: AbortSignal } = {}) {
  throwIfCanceled(options.signal);
  const key = process.env.SEARCHAPI_API_KEY;
  if (!key) throw new ShoppingError(503, "NOT_CONFIGURED", "Shopping service is not configured yet.");
  const url = new URL("https://www.searchapi.io/api/v1/search");
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  const stage = params.engine === "google_lens" ? "Photo identification" : "Price search";
  const timeout = AbortSignal.timeout(options.timeoutMs ?? 60000);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
      signal,
    });
    // Never return or log provider bodies: they can contain credentials or photo URLs.
    if (!response.ok) {
      throw new ShoppingError(response.status === 429 ? 429 : 502, "PROVIDER_UNAVAILABLE",
        response.status === 429 ? `${stage} is temporarily busy. Wait a moment before retrying.`
          : `${stage} is unavailable right now. Please retry.`);
    }
    const data = await response.json();
    throwIfCanceled(options.signal);
    if (!data || typeof data !== "object" || data.error ||
        (data.search_metadata?.status && data.search_metadata.status !== "Success")) {
      throw new ShoppingError(502, "PROVIDER_ERROR", `${stage} returned an unsuccessful response. Please retry.`);
    }
    return data;
  } catch (error) {
    throwIfCanceled(options.signal);
    if (error instanceof ShoppingError) throw error;
    if (signal.aborted) throw new ShoppingError(504, "PROVIDER_TIMEOUT", `${stage} timed out. Please retry this step.`);
    throw new ShoppingError(502, "PROVIDER_CONNECTION", `${stage} could not connect or read a response. Please retry.`);
  }
}

type Row = Record<string, unknown>;
const text = (value: unknown) => typeof value === "string" ? value.slice(0, 1000) : "";
export function safeUrl(value: unknown): string | null {
  try {
    const url = new URL(text(value));
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (!url.hostname.includes(".") || /^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(url.hostname)) return null;
    return url.href;
  } catch { return null; }
}
function rows(value: unknown): Row[] {
  return Array.isArray(value) ? value.filter(v => v && typeof v === "object") : [];
}

/** Provider thumbnails only; do not reintroduce removed Amazon image hosting. */
export function productImageUrl(value: unknown): string | null {
  const url = safeUrl(value);
  if (!url) return null;
  const host = new URL(url).hostname.toLowerCase();
  if (/(^|\.)(media-amazon\.com|ssl-images-amazon\.com|images-amazon\.com|amazonaws\.com|unpkg\.com)$/.test(host)) return null;
  return url;
}

export function normalizeMatches(data: Record<string, unknown>): PhotoMatch[] {
  const seen = new Set<string>();
  return rows(data.visual_matches).flatMap(row => {
    const title = text(row.title).trim();
    if (!title || seen.has(title.toLowerCase())) return [];
    seen.add(title.toLowerCase());
    return [{ title, source: text(row.source) || "Visual search result", url: safeUrl(row.link), imageUrl: productImageUrl(row.thumbnail) }];
  }).slice(0, 8);
}
export const isNotApplicable = (v: string) => /^(n\/a|na|none|not applicable)$/i.test(v.trim());
const normalize = (v: string) => v.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export function shoppingQuery(input: ComparisonInput) {
  return [input.product, ...[input.size, input.color].filter(v => !isNotApplicable(v)),
    input.quantity > 1 ? `${input.quantity} pack` : "", input.condition].filter(Boolean).join(" ");
}

export function normalizeOffers(data: Record<string, unknown>, input: Omit<ComparisonInput, "confirmed" | "condition"> & { condition: "new" | "used" | "any" }, currency: string) {
  const all = [...rows(data.shopping_results), ...rows(data.shopping_ads),
    ...rows(data.categorized_shopping_results).flatMap(group => rows(group.shopping_results))];
  const seen = new Set<string>();
  let excluded = 0;
  const offers: ShoppingOffer[] = [];
  for (const row of all) {
    const title = text(row.title);
    const url = safeUrl(row.link) || safeUrl(row.product_link);
    const priceText = text(row.price);
    const seller = text(row.seller) || "Seller not supplied";
    if (!title || !url || !priceText) { excluded++; continue; }
    const key = `${title}|${seller}|${priceText}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const explicitCurrency = text(row.currency).toUpperCase();
    // Only infer regional currency for unambiguous local price notation.
    const symbols: Record<string, RegExp> = {
      USD: /^\$|^US\$/, CAD: /^\$|^CA?\$/, AUD: /^\$|^A\$/, NZD: /^\$|^NZ\$/,
      GBP: /^£/, EUR: /^€|€$/, JPY: /^¥|^￥/, INR: /^₹|^Rs\.?/,
    };
    const embeddedCurrency = priceText.match(/\b(USD|CAD|AUD|NZD|GBP|EUR|JPY|CNY|INR|CHF|SGD|HKD|MXN)\b/)?.[1] ||
      (/^US\$/.test(priceText) ? "USD" : /^CA?\$/.test(priceText) ? "CAD" : /^A(?:U)?\$/.test(priceText) ? "AUD" : /^NZ\$/.test(priceText) ? "NZD" : null);
    const offerCurrency = /^[A-Z]{3}$/.test(explicitCurrency) ? explicitCurrency : embeddedCurrency
      ? embeddedCurrency
      : priceText.includes(currency) || symbols[currency]?.test(priceText) ? currency : null;
    const amount = typeof row.extracted_price === "number" && Number.isFinite(row.extracted_price) && row.extracted_price >= 0
      ? row.extracted_price : null;
    const condition = text(row.durability) || text(row.condition) || "Not stated by seller";
    const combined = `${title} ${priceText} ${condition}`;
    const restricted = Boolean(row.installment) ||
      (/\b(branded|customi[sz]ed|personali[sz]ed|promotional|wholesale|sample|deposit|quote)\b/i.test(combined) &&
        !/\b(branded|customi[sz]ed|personali[sz]ed|promotional|wholesale|sample|deposit|quote)\b/i.test(input.product)) ||
      /\b(month|monthly|payments?|trade.in|activation|contract|subscription|with plan|coupon|membership)\b|\/mo\b/i.test(combined) ||
      /\b(from|starting at)\b/i.test(priceText) ||
      (/\b(bundle|with|warranty|international version|renewed)\b|& more/i.test(title) &&
        !/\b(bundle|with|warranty|international version|renewed)\b|& more/i.test(input.product));
    const tokens = [input.product, ...[input.size, input.color].filter(v => !isNotApplicable(v))]
      .join(" ").split(/\s+/).map(normalize).filter(Boolean);
    const titleMatches = tokens.every(token => normalize(title).includes(token)) &&
      (input.quantity === 1 ? !/\b([2-9]|\d{2,})[\s-]*(pack|count|pcs|pieces)\b|\bpack of ([2-9]|\d{2,})\b/i.test(title)
        : new RegExp(`\\b${input.quantity}[\\s-]*(pack|count|pcs|pieces)\\b`, "i").test(title)) &&
      !(input.condition === "new" && /\b(used|pre.?owned|refurbished|renewed|open.?box)\b/i.test(combined)) &&
      !(input.condition === "used" && /\bnew\b/i.test(condition));
    const linkKind = /(^|\.)google\.[a-z.]+$/i.test(new URL(url).hostname) ? "comparison" : "store";
    offers.push({ title, seller, url, priceText, linkKind, imageUrl: productImageUrl(row.thumbnail) || productImageUrl(row.image), amount, currency: offerCurrency,
      delivery: text(row.delivery) || "Delivery cost not supplied",
      condition, titleMatches, restricted, providerOrder: offers.length });
  }
  // Rank only comparable currency, title-matching, non-financed prices.
  const rankable = (o: ShoppingOffer) => o.titleMatches && !o.restricted && o.currency === currency && o.amount !== null;
  offers.sort((a, b) => Number(rankable(b)) - Number(rankable(a)) ||
    (rankable(a) && rankable(b) ? a.amount! - b.amount! : 0));
  return { offers: offers.slice(0, 40), excluded };
}
