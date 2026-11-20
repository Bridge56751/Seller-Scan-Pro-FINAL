import { Pool } from "pg";
import { verifyRevenueCat } from "./verify-revenuecat";
import { testScansApproved } from "../../shared/test-scan-policy";

const pool = new Pool({connectionString:process.env.SUPABASE_DATABASE_URL,max:2,
  connectionTimeoutMillis:10000,query_timeout:10000,statement_timeout:10000});

console.info("[Scan access configuration]", {
  development: process.env.NODE_ENV === "development",
  testerApprovalConfigured: !!process.env.TEST_SCAN_CUSTOMER_IDS,
  deploymentFlagPresent: !!process.env.REPLIT_DEPLOYMENT,
});

export async function approvedTestIdentity(customerId:string):Promise<string|null> {
  if (process.env.NODE_ENV!=="development" || !process.env.TEST_SCAN_CUSTOMER_IDS ||
    process.env.REPLIT_DEPLOYMENT) return null;
  const result=await pool.query("SELECT test_customer_id FROM device_customers WHERE customer_id=$1",[customerId]);
  const testId=result.rows[0]?.test_customer_id;
  return testId && testScansApproved(testId) ? testId : null;
}

export async function verifyScanAccess(customerId:string, refresh=false) {
  // TestFlight uses Apple's sandbox, not RevenueCat's simulated Test Store.
  // Both lookups use the authenticated server-owned customer, never a client flag.
  const [liveResult, sandboxResult] = await Promise.allSettled([
    verifyRevenueCat(customerId,false,refresh),
    verifyRevenueCat(customerId,"apple-sandbox",refresh),
  ]);
  const live = liveResult.status === "fulfilled" ? liveResult.value : null;
  const sandbox = sandboxResult.status === "fulfilled" ? sandboxResult.value : null;
  // A verified current entitlement is sufficient; an outage is never a grant.
  if (!live?.hasAccess && !sandbox?.hasAccess) {
    if (liveResult.status === "rejected") throw liveResult.reason;
    if (sandboxResult.status === "rejected") throw sandboxResult.reason;
  }
  let hasTestScanAccess=!live?.hasAccess && sandbox?.hasAccess === true;
  let expirationDate = live?.hasAccess ? live.expirationDate : sandbox?.expirationDate ?? null;
  // Lookup only server-owned mapping. Never accept a caller-supplied test ID.
  if (!live?.hasAccess && !hasTestScanAccess) {
    const testId=await approvedTestIdentity(customerId);
    if (testId) {
      const test = await verifyRevenueCat(testId,true,refresh);
      hasTestScanAccess=test.hasAccess;
      if (hasTestScanAccess) expirationDate=test.expirationDate;
    }
  }
  return {isPaid:live?.hasAccess === true,hasTestScanAccess,
    hasAppleSandboxAccess:sandbox?.hasAccess === true,expirationDate};
}
