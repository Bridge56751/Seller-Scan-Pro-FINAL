export function testScansApproved(testCustomerId: string, env: Record<string,string|undefined> = process.env) {
  if (env.NODE_ENV !== "development" || env.REPLIT_DEPLOYMENT ||
    env.REPLIT_ENVIRONMENT === "production") return false;
  return !!testCustomerId && (env.TEST_SCAN_CUSTOMER_IDS || "").split(",")
    .map(value => value.trim()).filter(Boolean).includes(testCustomerId);
}
