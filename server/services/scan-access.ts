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
  const live = await verifyRevenueCat(customerId,false,refresh);
  let hasTestScanAccess=false;
  // Lookup only server-owned mapping. Never accept a caller-supplied test ID.
  if (!live.hasAccess) {
    const testId=await approvedTestIdentity(customerId);
    if (testId) {
      hasTestScanAccess=(await verifyRevenueCat(testId,true,refresh)).hasAccess;
    }
  }
  return {isPaid:live.hasAccess,hasTestScanAccess,expirationDate:live.expirationDate};
}
