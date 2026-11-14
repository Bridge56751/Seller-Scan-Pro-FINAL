import type { ShoppingOffer } from "./shopping";

export type PriceSort = "accurate" | "low" | "high";
export function isComparablePrice(offer: ShoppingOffer, currency?: string) {
  return offer.titleMatches && !offer.restricted && !!currency && offer.currency === currency &&
    typeof offer.amount === "number" && Number.isFinite(offer.amount) && offer.amount >= 0;
}
export function sortOffersByPrice(offers: ShoppingOffer[], currency: string | undefined, order: PriceSort, query = "") {
  if (order === "accurate") {
    const words = (value: string) => value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
    const tokens = [...new Set(words(query))];
    const coverage = (offer: ShoppingOffer) => {
      const title = new Set(words(offer.title));
      return tokens.filter(token => title.has(token)).length;
    };
    // Text relevance is a heuristic, not verified visual identity. Never use price as a relevance signal.
    return [...offers].sort((a, b) => Number(b.titleMatches) - Number(a.titleMatches) ||
      coverage(b) - coverage(a) ||
      (a.providerOrder ?? offers.indexOf(a)) - (b.providerOrder ?? offers.indexOf(b)));
  }
  const hasPrice = (offer: ShoppingOffer) => typeof offer.amount === "number" &&
    Number.isFinite(offer.amount) && offer.amount >= 0;
  return [...offers].sort((a, b) => {
    // Price sorting is independent of match confidence and promotional restrictions.
    // Never compare raw amounts from different currencies as if they were equivalent.
    const group = (offer: ShoppingOffer) => !hasPrice(offer) ? 2 :
      currency && offer.currency === currency ? 0 : 1;
    const difference = group(a) - group(b);
    if (difference) return difference;
    if (!hasPrice(a)) return 0;
    const currencyOrder = (a.currency || "").localeCompare(b.currency || "");
    if (currencyOrder) return currencyOrder;
    return order === "low" ? a.amount! - b.amount! : b.amount! - a.amount!;
  });
}
