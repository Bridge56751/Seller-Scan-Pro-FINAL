import test from "node:test";
import assert from "node:assert/strict";
import { sortOffersByPrice } from "../shared/offer-sorting";
import type { ShoppingOffer } from "../shared/shopping";
const offer = (amount: number | null, overrides: Partial<ShoppingOffer> = {}): ShoppingOffer => ({
  title: "Bottle", seller: "Store", url: "https://example.com", priceText: String(amount),
  imageUrl: null, currency: "USD", amount, delivery: "", condition: "new",
  titleMatches: true, restricted: false, ...overrides,
});
test("accuracy prioritizes matches and title relevance, not cheap prices", () => {
  const source = [
    offer(1, { title: "Bottle sleeve", titleMatches: false, providerOrder: 0 }),
    offer(9, { title: "Blue bottle", providerOrder: 2 }),
    offer(100, { title: "Blue bottle", providerOrder: 1 }),
    offer(2, { title: "Blue bottle accessory", titleMatches: false, providerOrder: 3 }),
  ];
  assert.deepEqual(sortOffersByPrice(source, "USD", "accurate", "Blue bottle"),
    [source[2], source[1], source[3], source[0]]);
  assert.deepEqual(source.map(row => row.amount), [1, 9, 100, 2]);
});
test("accuracy supports older saved scans without provider order", () => {
  const source = [offer(20), offer(10)];
  assert.deepEqual(sortOffersByPrice(source, "USD", "accurate"), source);
  assert.deepEqual(sortOffersByPrice([], "USD", "accurate"), []);
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
