import test from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { reserveScan, finishFreeScan, scanAllowances } from "../server/services/scan-rate-limits";

test("five shared successful scans: concurrent reservations, failure release, permits, expiry and lifetime enforcement", async t => {
  t.mock.method(ReplitConnectors.prototype, "proxy", async () => new Response(null, {status:404}));
  const db = new Pool({connectionString:process.env.SUPABASE_DATABASE_URL});
  const id = `shared_test_${randomUUID()}`;
  try {
    await db.query("INSERT INTO device_customers(device_hash,credential_hash,customer_id,test_customer_id) VALUES($1,$2,$1,$3)", [id,"a".repeat(64),`${id}_test`]);
    const attempts = await Promise.allSettled(Array.from({length:8}, (_, i) => reserveScan(id,true,undefined,i%2 ? "photo":"barcode")));
    const accepted = attempts.filter(r => r.status==="fulfilled").map(r => r.value);
    assert.equal(accepted.length,5);
    for (const r of attempts) if (r.status==="rejected") assert.equal(r.reason.code,"SCAN_IN_PROGRESS");
    assert.equal((await scanAllowances(id)).freeScansLeft,5,"Pending scans are not successes");
    await finishFreeScan(id,accepted[0].reservationId,false);
    await assert.rejects(reserveScan(id,false,accepted[0].scanPermit),{code:"INVALID_SCAN_PERMIT"});
    const replacement = await reserveScan(id,true,undefined,"photo");
    await finishFreeScan(id,replacement.reservationId,true);
    await assert.rejects(finishFreeScan(id,replacement.reservationId,true),{code:"SCAN_EXPIRED"});
    for (const item of accepted.slice(1)) {
      const followup = await reserveScan(id,false,item.scanPermit);
      await finishFreeScan(id,followup.reservationId,true);
      await assert.rejects(reserveScan(id,false,item.scanPermit),{code:"INVALID_SCAN_PERMIT"});
    }
    assert.equal((await scanAllowances(id)).freeScansLeft,0);
    for (const kind of ["photo","barcode","search"] as const)
      await assert.rejects(reserveScan(id,true,undefined,kind),{code:"SUBSCRIPTION_REQUIRED"});
    await db.query("UPDATE customer_scan_limits SET month_start=month_start-interval '1 month',recent_scans='{}' WHERE customer_id=$1",[id]);
    await assert.rejects(reserveScan(id,true,undefined,"barcode"),{code:"SUBSCRIPTION_REQUIRED"});
    // Simulate an unfinished slot and ensure expired results cannot consume/grant access.
    await db.query("UPDATE customer_scan_limits SET free_successful_scans=4 WHERE customer_id=$1",[id]);
    const stale = await reserveScan(id,true,undefined,"barcode");
    await db.query("UPDATE free_scan_reservations SET expires_at=clock_timestamp()-interval '1 second' WHERE id=$1",[stale.reservationId]);
    await assert.rejects(finishFreeScan(id,stale.reservationId,true),{code:"SCAN_EXPIRED"});
    const fresh = await reserveScan(id,true,undefined,"photo");
    await assert.rejects(finishFreeScan(id,stale.reservationId,true),{code:"SCAN_EXPIRED"});
    await finishFreeScan(id,fresh.reservationId,false);
    assert.equal((await scanAllowances(id)).freeScansLeft,1,"Empty/failed results don't spend allowance");
    await db.query("UPDATE customer_scan_limits SET monthly_count=1000 WHERE customer_id=$1",[id]);
    await assert.rejects(reserveScan(id,true,undefined,"photo"),{code:"MONTHLY_SCAN_LIMIT"});
  } finally {
    await db.query("DELETE FROM device_customers WHERE customer_id=$1",[id]);
    await db.end();
  }
});
