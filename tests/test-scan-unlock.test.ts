import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { testScansApproved } from "../shared/test-scan-policy";
import { verifyScanAccess } from "../server/services/scan-access";
import { reserveScan } from "../server/services/scan-rate-limits";
import { verifyRevenueCat } from "../server/services/verify-revenuecat";

test("test scan approval is exact, server-only, and never production",()=>{
  const env={NODE_ENV:"development",TEST_SCAN_CUSTOMER_IDS:"ss_test_approved"};
  assert.equal(testScansApproved("ss_test_approved",env),true);
  assert.equal(testScansApproved("ss_test_other",env),false);
  assert.equal(testScansApproved("ss_test_approved",{...env,NODE_ENV:"production"}),false);
  assert.equal(testScansApproved("ss_test_approved",{...env,REPLIT_DEPLOYMENT:"1"}),false);
  assert.equal(testScansApproved("ss_test_approved",{...env,REPLIT_ENVIRONMENT:"production"}),true);
  assert.equal(testScansApproved("ss_test_approved",{...env,REPLIT_ENVIRONMENT:"production",REPLIT_DEPLOYMENT:"1"}),false);
  assert.equal(testScansApproved("ss_test_approved",{NODE_ENV:"development"}),false);
});

test("approved verified tester scans past free limits without paid access; caps and production isolation remain",async t=>{
  const envKeys=["NODE_ENV","TEST_SCAN_CUSTOMER_IDS","REPLIT_DEPLOYMENT","REPLIT_ENVIRONMENT"] as const;
  const prior=Object.fromEntries(envKeys.map(key=>[key,process.env[key]]));
  const id=`test_unlock_${randomUUID()}`,testId=`ss_test_${randomUUID()}`,other=`test_unlock_${randomUUID()}`;
  let valid=true;
  t.mock.method(ReplitConnectors.prototype,"proxy",async(_connector:string,path:string)=>{
    if(!path.includes(encodeURIComponent(testId)) || !path.includes("sandbox"))return new Response(null,{status:404});
    return Response.json({items:[{environment:"sandbox",store:"test_store",gives_access:true,
      current_period_ends_at:Date.now()+(valid?3600000:-1000),
      entitlements:{items:[{id:process.env.REVENUECAT_PRO_ENTITLEMENT_ID}]}}]});
  });
  const db=new Pool({connectionString:process.env.SUPABASE_DATABASE_URL});
  try {
    process.env.NODE_ENV="development";
    process.env.TEST_SCAN_CUSTOMER_IDS=testId;
    delete process.env.REPLIT_DEPLOYMENT;
    // Reproduce the actual workspace platform marker, not a published app.
    process.env.REPLIT_ENVIRONMENT="production";
    for(const [customer,tid] of [[id,testId],[other,`ss_test_${randomUUID()}`]]){
      await db.query("INSERT INTO device_customers(device_hash,credential_hash,customer_id,test_customer_id) VALUES($1,$2,$1,$3)",[customer,"a".repeat(64),tid]);
      await db.query(`INSERT INTO customer_scan_limits(customer_id,month_start,free_successful_scans)
        VALUES($1,date_trunc('month',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC',5)`,[customer]);
    }
    const access=await verifyScanAccess(id);
    assert.equal(access.isPaid,false);
    assert.equal(access.hasTestScanAccess,true);
    assert.equal((await verifyScanAccess(other)).hasTestScanAccess,false);
    await assert.rejects(reserveScan(other,true,undefined,"photo"),{code:"SUBSCRIPTION_REQUIRED"});
    const photo=await reserveScan(id,true,undefined,"photo");
    const barcode=await reserveScan(id,true,undefined,"barcode");
    await reserveScan(id,false,photo.scanPermit);
    await reserveScan(id);
    assert.equal((await db.query("SELECT test_only FROM scan_search_permits WHERE id=$1",[barcode.scanPermit])).rows[0].test_only,true);
    process.env.NODE_ENV="production";
    assert.equal((await verifyScanAccess(id)).hasTestScanAccess,false);
    await assert.rejects(reserveScan(id,true,undefined,"photo"),{code:"SUBSCRIPTION_REQUIRED"});
    await assert.rejects(reserveScan(id,false,barcode.scanPermit),{code:"INVALID_SCAN_PERMIT"});
    process.env.NODE_ENV="development";
    process.env.REPLIT_DEPLOYMENT="1";
    await assert.rejects(reserveScan(id,false,barcode.scanPermit),{code:"INVALID_SCAN_PERMIT"});
    delete process.env.REPLIT_DEPLOYMENT;
    process.env.TEST_SCAN_CUSTOMER_IDS="";
    await assert.rejects(reserveScan(id,false,barcode.scanPermit),{code:"INVALID_SCAN_PERMIT"});
    process.env.TEST_SCAN_CUSTOMER_IDS=testId;
    await reserveScan(id,false,barcode.scanPermit);
    await db.query("UPDATE customer_scan_limits SET monthly_count=1000 WHERE customer_id=$1",[id]);
    await assert.rejects(reserveScan(id),{code:"MONTHLY_SCAN_LIMIT"});
    await db.query("UPDATE customer_scan_limits SET monthly_count=0,recent_scans=array_fill(now(),ARRAY[10]) WHERE customer_id=$1",[id]);
    await assert.rejects(reserveScan(id),{code:"MINUTE_SCAN_LIMIT"});
    valid=false;
    await verifyRevenueCat(testId,true,true);
    assert.equal((await verifyScanAccess(id)).hasTestScanAccess,false);
    await assert.rejects(reserveScan(id,true,undefined,"photo"),{code:"SUBSCRIPTION_REQUIRED"});
  } finally {
    for(const key of envKeys)if(prior[key]===undefined)delete process.env[key];else Object.assign(process.env,{[key]:prior[key]});
    await db.query("DELETE FROM device_customers WHERE customer_id=ANY($1::text[])",[[id,other]]);
    await db.end();
  }
});
