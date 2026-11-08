import test from "node:test";
import assert from "node:assert/strict";
import { sortOffersByPrice } from "../shared/offer-sorting";
import type { ShoppingOffer } from "../shared/shopping";
const offer = (amount: number | null, overrides: Partial<ShoppingOffer> = {}): ShoppingOffer => ({
  title: "Bottle", seller: "Store", url: "https://example.com", priceText: String(amount),
  imageUrl: null, currency: "USD", amount, delivery: "", condition: "new",
  titleMatches: true, restricted: false, ...overrides,
});
test("price control sorts numerically both ways without mutating saved results", () => {
  const source = [offer(100), offer(9), offer(25)];
  assert.deepEqual(sortOffersByPrice(source, "USD", "low").map(row => row.amount), [9, 25, 100]);
  assert.deepEqual(sortOffersByPrice(source, "USD", "high").map(row => row.amount), [100, 25, 9]);
  assert.deepEqual(source.map(row => row.amount), [100, 9, 25]);
});
test("every local price sorts together regardless of match confidence or restrictions", () => {
  const extras = [offer(null), offer(1, { currency: "EUR" }), offer(0.01, { restricted: true }), offer(2, { titleMatches: false }), offer(NaN)];
  const source = [...extras, offer(9), offer(100)];
  const low = sortOffersByPrice(source, "USD", "low");
  assert.deepEqual(low.slice(0, 4).map(row => row.amount), [0.01, 2, 9, 100]);
  const high = sortOffersByPrice(source, "USD", "high");
  assert.deepEqual(high.slice(0, 4).map(row => row.amount), [100, 9, 2, 0.01]);
  for (const sorted of [low, high]) assert.deepEqual(sorted.slice(4), [extras[1], extras[0], extras[4]]);
});
test("empty lists and equal prices preserve a stable order", () => {
  assert.deepEqual(sortOffersByPrice([], "USD", "low"), []);
  const source = [offer(10, { seller: "A" }), offer(10, { seller: "B" })];
  assert.deepEqual(sortOffersByPrice(source, "USD", "high"), source);
});
