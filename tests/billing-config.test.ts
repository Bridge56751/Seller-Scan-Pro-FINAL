import test from "node:test";
import assert from "node:assert/strict";
import { billingConfig } from "../server/services/billing-config";

test("Test Store configuration is refused outside development", () => {
  for (const NODE_ENV of ["production", "test", undefined]) {
    const result = billingConfig(true, { NODE_ENV, REVENUECAT_TEST_STORE_API_KEY: "test_fixture" });
    assert.equal(result.status, 404);
    assert.equal("apiKey" in result.body, false);
  }
});
test("Test Store never falls back to the Apple key", () => {
  for (const key of [undefined, "appl_fixture", "sk_fixture"]) {
    const result = billingConfig(true, { NODE_ENV: "development", REVENUECAT_TEST_STORE_API_KEY: key, REVENUECAT_API_KEY: "appl_fixture" });
    assert.equal(result.status, 503);
    assert.equal("apiKey" in result.body, false);
  }
});
test("Separate public Test Store key is served only when explicitly requested", () => {
  const env = { NODE_ENV: "development", REVENUECAT_TEST_STORE_API_KEY: "test_fixture", REVENUECAT_API_KEY: "appl_fixture" };
  assert.deepEqual(billingConfig(true, env).body, { apiKey: "test_fixture", mode: "test" });
  assert.deepEqual(billingConfig(false, env).body, { apiKey: "appl_fixture", mode: "native" });
});
test("Native configuration never exposes Test Store or secret REST keys", () => {
  for (const key of ["test_fixture", "sk_fixture", ""]) {
    assert.equal(billingConfig(false, { NODE_ENV: "production", REVENUECAT_API_KEY: key }).status, 503);
  }
});
