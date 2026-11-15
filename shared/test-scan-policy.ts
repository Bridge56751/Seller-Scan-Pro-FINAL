export function testScansApproved(testCustomerId: string, env: Record<string,string|undefined> = process.env) {
  // REPLIT_ENVIRONMENT describes Replit's platform, including workspaces.
  // REPLIT_DEPLOYMENT is the published-app marker.
  if (env.NODE_ENV !== "development" || env.REPLIT_DEPLOYMENT) return false;
  return !!testCustomerId && (env.TEST_SCAN_CUSTOMER_IDS || "").split(",")
    .map(value => value.trim()).filter(Boolean).includes(testCustomerId);
}
