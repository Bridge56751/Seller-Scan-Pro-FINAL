import test from "node:test";
import assert from "node:assert/strict";
import { photoSearchQueries } from "../shared/photo-search-query";
import { findListings } from "../server/services/listing-search";
import { searchApi, ShoppingError } from "../server/services/searchapi";

const query = "Stanley Quencher H2.0 FlowState 40 oz insulated stainless steel travel tumbler";
const input = { country: "US", query, condition: "any" as const, automatic: true };
const data = { shopping_results: [{
  title: query, price: "$30", extracted_price: 30, product_link: "https://example.com/bottle",
}] };

test("photo title cleanup preserves model and size while removing page noise", () => {
  assert.equal(photoSearchQueries("Buy Sony WH-1000XM5 Black | Retailer Online")[0], "Sony WH-1000XM5 Black");
  assert.equal(photoSearchQueries("Stanley 40 oz - Shop online now")[0], "Stanley 40 oz");
  assert.deepEqual(photoSearchQueries("Sony WH-1000XM5"), ["Sony WH-1000XM5"]);
  assert.equal(photoSearchQueries(query).length, 2);
});
test("successful searches return immediately without fallback or ad resolution", async () => {
  let calls = 0;
  const result = await findListings(input, "USD", async (params, options) => {
    calls++;
    assert.equal(params.link, "raw");
    assert.equal(params.condition, undefined);
    assert.ok(options!.timeoutMs! <= 60000);
    return data;
  });
  assert.equal(calls, 1);
  assert.equal(result.fallbackUsed, false);
  assert.equal(result.offers.length, 1);
});
test("empty automatic searches try exactly one shorter query", async () => {
  const queries: string[] = [];
  const result = await findListings(input, "USD", async params => {
    queries.push(params.q);
    return queries.length === 1 ? { shopping_results: [] } : data;
  });
  assert.deepEqual(queries, photoSearchQueries(query));
  assert.equal(result.query, queries[1]);
  assert.equal(result.fallbackUsed, true);
});
test("manual searches stay exact, and errors are not retried as empty matches", async () => {
  let calls = 0;
  await findListings({ ...input, automatic: false }, "USD", async params => {
    calls++; assert.equal(params.q, query); return {};
  });
  assert.equal(calls, 1);
  calls = 0;
  await assert.rejects(findListings(input, "USD", async () => {
    calls++; throw new ShoppingError(429, "PROVIDER_UNAVAILABLE", "busy");
  }), /busy/);
  assert.equal(calls, 1);
});
test("fallback does not receive a fresh 60-second budget", async () => {
  const originalNow = Date.now;
  let now = originalNow();
  Date.now = () => now;
  try {
    let calls = 0;
    await findListings(input, "USD", async () => { calls++; now += 55000; return {}; });
    assert.equal(calls, 1, "skip fallback when less than ten seconds remain");
    const budgets: number[] = [];
    await findListings(input, "USD", async (_params, options) => {
      budgets.push(options!.timeoutMs!); now += 20000; return {};
    });
    assert.deepEqual(budgets, [60000, 40000]);
  } finally { Date.now = originalNow; }
});
test("provider timeout covers reading the response body and reports the failing step", async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.SEARCHAPI_API_KEY;
  process.env.SEARCHAPI_API_KEY = "test-only";
  const hold = setTimeout(() => {}, 1000);
  global.fetch = async (_url, init) => ({
    ok: true,
    json: () => new Promise((_resolve, reject) => {
      init!.signal!.addEventListener("abort", () => reject(new Error("private provider response")));
    }),
  }) as Response;
  try {
    await assert.rejects(searchApi({ engine: "google_lens" }, { timeoutMs: 10 }), (error: unknown) =>
      error instanceof ShoppingError && error.code === "PROVIDER_TIMEOUT" && /Photo identification timed out/.test(error.message));
  } finally {
    clearTimeout(hold); global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.SEARCHAPI_API_KEY;
    else process.env.SEARCHAPI_API_KEY = originalKey;
  }
});

test("canceled empty first result never starts a paid fallback", async () => {
  const controller = new AbortController();
  let calls = 0;
  await assert.rejects(findListings(input, "USD", async (_params, options) => {
    calls++;
    assert.equal(options?.signal, controller.signal);
    controller.abort();
    return {};
  }, undefined, controller.signal), { name: "AbortError" });
  assert.equal(calls, 1);
});

test("cancel while fallback is in flight discards its late response", async () => {
  const controller = new AbortController();
  let calls = 0;
  await assert.rejects(findListings(input, "USD", async () => {
    if (++calls === 2) controller.abort();
    return {};
  }, undefined, controller.signal), { name: "AbortError" });
  assert.equal(calls, 2);
});

test("pre-canceled provider request never fetches", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(searchApi({ engine: "google_lens" }, { signal: controller.signal }), { name: "AbortError" });
});
