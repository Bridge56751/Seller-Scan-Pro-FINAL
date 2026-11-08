import type { ShoppingOffer } from "./shopping";

export type PriceSort = "low" | "high";
export function isComparablePrice(offer: ShoppingOffer, currency?: string) {
  return offer.titleMatches && !offer.restricted && !!currency && offer.currency === currency &&
    typeof offer.amount === "number" && Number.isFinite(offer.amount) && offer.amount >= 0;
}
export function sortOffersByPrice(offers: ShoppingOffer[], currency: string | undefined, order: PriceSort) {
  return [...offers].sort((a, b) => {
    const comparableA = isComparablePrice(a, currency);
    const comparableB = isComparablePrice(b, currency);
    if (comparableA !== comparableB) return comparableA ? -1 : 1;
    if (!comparableA) return 0;
    return order === "low" ? a.amount! - b.amount! : b.amount! - a.amount!;
  });
}
