type BillingEnv = { NODE_ENV?: string; REVENUECAT_API_KEY?: string; REVENUECAT_TEST_STORE_API_KEY?: string };

export function billingConfig(testRequested: boolean, env: BillingEnv) {
  if (testRequested) {
    if (env.NODE_ENV !== "development") return { status: 404, body: { error: "Billing tests are only available in development." } };
    const apiKey = env.REVENUECAT_TEST_STORE_API_KEY || "";
    if (!apiKey.startsWith("test_")) return { status: 503, body: { error: "The RevenueCat Test Store SDK key is missing or invalid." } };
    return { status: 200, body: { apiKey, mode: "test" } };
  }
  const apiKey = env.REVENUECAT_API_KEY || "";
  // Only public native SDK keys may be delivered to the app. Never expose a secret REST key.
  if (!/^(appl_|goog_|amzn_)/.test(apiKey)) return { status: 503, body: { error: "Native billing is not configured with a public store SDK key." } };
  return { status: 200, body: { apiKey, mode: "native" } };
}
