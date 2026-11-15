import test from "node:test";
import assert from "node:assert/strict";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { verifyRevenueCat } from "../server/services/verify-revenuecat";

test("RevenueCat caches free customers, deduplicates requests, and refreshes after purchase", async t => {
  let calls = 0;
  const proxy = t.mock.method(ReplitConnectors.prototype, "proxy", async () => {
    calls++;
    return new Response(null, { status: 404 });
  });
  await Promise.all([verifyRevenueCat("cache-test-free"), verifyRevenueCat("cache-test-free")]);
  await verifyRevenueCat("cache-test-free");
  assert.equal(calls, 1);
  await verifyRevenueCat("cache-test-free", false, true);
  assert.equal(calls, 2);
  proxy.mock.mockImplementation(async () => { calls++; return new Response(null, { status: 503 }); });
  await assert.rejects(verifyRevenueCat("cache-test-free", false, true));
  await assert.rejects(verifyRevenueCat("cache-test-free"));
  assert.equal(calls, 4, "Failures must invalidate old access and must not be cached");
});

test("Cached paid access never survives the subscription expiry", async t => {
  const now = Date.now();
  let clock = now;
  t.mock.method(Date, "now", () => clock);
  let calls = 0;
  t.mock.method(ReplitConnectors.prototype, "proxy", async () => {
    calls++;
    return Response.json({ items: [{
      environment: "production", store: "app_store", gives_access: true,
      current_period_ends_at: now + 1000,
      entitlements: { items: [{ id: process.env.REVENUECAT_PRO_ENTITLEMENT_ID }] },
    }] });
  });
  assert.equal((await verifyRevenueCat("cache-test-expiry")).hasAccess, true);
  clock = now + 500;
  assert.equal((await verifyRevenueCat("cache-test-expiry")).hasAccess, true);
  assert.equal(calls, 1);
  clock = now + 1001;
  assert.equal((await verifyRevenueCat("cache-test-expiry")).hasAccess, false);
  assert.equal(calls, 2);
});
