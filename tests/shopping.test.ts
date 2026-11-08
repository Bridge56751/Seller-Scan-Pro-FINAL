import test from "node:test";
import assert from "node:assert/strict";
import { comparisonSchema, countryInfo } from "../shared/shopping";
import { normalizeMatches, normalizeOffers, safeUrl, shoppingQuery, searchApi, ShoppingError } from "../server/services/searchapi";

const input = { product: "Sony WH-1000XM5", color: "Black", size: "N/A", quantity: 1, condition: "new", country: "US", confirmed: true } as const;

test("comparison requires explicit variant details and confirmation", () => {
  assert.equal(comparisonSchema.safeParse(input).success, true);
  for (const patch of [{ confirmed: false }, { size: "" }, { color: "" }, { quantity: 0 }, { quantity: 1.5 }, { product: "" }]) {
    assert.equal(comparisonSchema.safeParse({ ...input, ...patch }).success, false);
  }
});
test("regional coverage never falls back to US", () => {
  assert.equal(countryInfo("ZZ"), undefined);
  assert.equal(countryInfo("GB")?.[2], "GBP");
  assert.equal(countryInfo("CA")?.[2], "CAD");
});
test("query includes chosen variant, pack and condition but omits explicit N/A", () => {
  assert.equal(shoppingQuery(input), "Sony WH-1000XM5 Black new");
  assert.match(shoppingQuery({ ...input, quantity: 2, size: "large", condition: "used" }), /large Black 2 pack used/);
});
test("visual matches are deduplicated and unsafe links are dropped", () => {
  const matches = normalizeMatches({ visual_matches: [
    { title: "Product", link: "javascript:alert(1)" }, { title: "Product" }, {},
    { title: "Other", source: "Shop", link: "https://example.com/product" },
  ] });
  assert.equal(matches.length, 2);
  assert.equal(matches[0].url, null);
  assert.equal(matches[1].source, "Shop");
});
test("only comparable item prices sort first; financed, currency and variant mismatches remain unranked", () => {
  const row = { title: "Sony WH-1000XM5 Black", seller: "Retailer", price: "$299", extracted_price: 299, product_link: "https://example.com/product" };
  const { offers } = normalizeOffers({ shopping_results: [
    { ...row, title: "Sony WH-1000XM4 Black", price: "$50", extracted_price: 50 },
    { ...row, price: "$5/mo", extracted_price: 5, installment: { months: "24" } },
    { ...row, price: "€100", currency: "EUR", extracted_price: 100 },
    row,
    { ...row, seller: "Other", price: "$250", extracted_price: 250 },
    { ...row, title: "Sony WH-1000XM5 Black refurbished", price: "$99", extracted_price: 99 },
  ] }, input, "USD");
  assert.equal(offers[0].amount, 250);
  assert.equal(offers[1].amount, 299);
  assert.equal(offers.find(v => v.amount === 5)?.restricted, true);
  assert.equal(offers.find(v => v.amount === 99)?.titleMatches, false);
  assert.equal(offers.find(v => v.amount === 50)?.titleMatches, false);
});
test("missing prices are never invented, duplicate listings removed, invalid URLs omitted", () => {
  const row = { title: "Sony WH-1000XM5 Black", price: "$199", link: "https://example.com/item", seller: "Shop" };
  const result = normalizeOffers({ shopping_ads: [row, row, { ...row, link: "javascript:bad" }, { title: "no price" }] }, input, "USD");
  assert.equal(result.offers.length, 1);
  assert.equal(result.offers[0].amount, null);
  assert.equal(result.excluded, 2);
  assert.equal(safeUrl("https://user:pass@example.com"), null);
});
test("empty provider results remain empty", () => {
  assert.deepEqual(normalizeMatches({}), []);
  assert.deepEqual(normalizeOffers({}, input, "USD"), { offers: [], excluded: 0 });
});
test("product thumbnails are preserved without unsafe or removed image hosts", () => {
  const row = { title: "Sony WH-1000XM5 Black", price: "$199", link: "https://example.com/item", seller: "Shop" };
  const thumbnails = ["https://example.com/product.jpg", "javascript:bad", "https://m.media-amazon.com/image.jpg", "https://unpkg.com/image.png", undefined];
  const { offers } = normalizeOffers({ shopping_results: thumbnails.map((thumbnail, index) => ({ ...row, seller: `Shop ${index}`, thumbnail })) }, input, "USD");
  assert.deepEqual(offers.map(offer => offer.imageUrl), ["https://example.com/product.jpg", null, null, null, null]);
  assert.equal(normalizeMatches({ visual_matches: [{ title: "Bottle", thumbnail: thumbnails[0] }] })[0].imageUrl, thumbnails[0]);
});
test("foreign currency labels and bundles never sort as ordinary local prices", () => {
  const row = { title: "Sony WH-1000XM5 Black", price: "$20 CAD", extracted_price: 20, link: "https://example.com/item" };
  const { offers } = normalizeOffers({ shopping_results: [
    row, { ...row, title: `${row.title} Bundle with stand`, price: "$10 USD" },
    { ...row, title: `${row.title} Pack of 3`, price: "$5" },
  ] }, input, "USD");
  assert.equal(offers[0].currency, "CAD");
  assert.equal(offers[1].restricted, true);
  assert.equal(offers[2].titleMatches, false);
});
test("provider failures are sanitized and never expose provider bodies", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response('{"error":"private provider details"}', { status: 429 });
  try {
    await assert.rejects(searchApi({ engine: "google_shopping", q: "test" }), (e: unknown) =>
      e instanceof ShoppingError && [429, 503].includes(e.status) && !e.message.includes("private"));
  } finally { global.fetch = originalFetch; }
});
