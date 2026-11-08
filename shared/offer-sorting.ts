import type { ShoppingOffer } from "./shopping";

export type PriceSort = "low" | "high";
export function isComparablePrice(offer: ShoppingOffer, currency?: string) {
  return offer.titleMatches && !offer.restricted && !!currency && offer.currency === currency &&
    typeof offer.amount === "number" && Number.isFinite(offer.amount) && offer.amount >= 0;
}
export function sortOffersByPrice(offers: ShoppingOffer[], currency: string | undefined, order: PriceSort) {
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
