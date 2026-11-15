import test from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { reserveScan, ScanLimitError } from "../server/services/scan-rate-limits";
import { mockPaidCustomer } from "./billing-fixture";

test("durable customer limits handle races, UTC rollover, and single-use search permits", async t => {
  mockPaidCustomer(t);
  const db = new Pool({ connectionString: process.env.SUPABASE_DATABASE_URL });
  const customer = `limit_test_${randomUUID()}`;
  const other = `limit_test_${randomUUID()}`;
  try {
    for (const id of [customer,other]) {
      await db.query(`INSERT INTO device_customers(device_hash,credential_hash,customer_id,test_customer_id)
        VALUES($1,$2,$1,$3)`, [id,"a".repeat(64),`${id}_test`]);
    }
    const attempts = await Promise.allSettled(Array.from({length:20}, () => reserveScan(customer,true)));
    const accepted = attempts.filter(r=>r.status==="fulfilled");
    assert.equal(accepted.length,10);
    const denied = attempts.filter(r=>r.status==="rejected");
    for (const result of denied) {
      assert.equal(result.reason.code,"MINUTE_SCAN_LIMIT");
      assert.ok(result.reason.retryAfter>0 && result.reason.retryAfter<=60);
    }
    assert.equal((await db.query("SELECT monthly_count FROM customer_scan_limits WHERE customer_id=$1",[customer])).rows[0].monthly_count,10);
    const permit = accepted[0].value.scanPermit!;
    await assert.rejects(reserveScan(other,false,permit), {code:"INVALID_SCAN_PERMIT"});
    // Completion still works at the minute limit; it does not start a new scan.
    const duplicate = await Promise.allSettled([reserveScan(customer,false,permit),reserveScan(customer,false,permit)]);
    assert.equal(duplicate.filter(r=>r.status==="fulfilled").length,1);
    await assert.rejects(reserveScan(customer,false,"forged"), {code:"INVALID_SCAN_PERMIT"});
    const expired = accepted[1].value.scanPermit!;
    await db.query("UPDATE scan_search_permits SET expires_at=now()-interval '1 second' WHERE id=$1",[expired]);
    await assert.rejects(reserveScan(customer,false,expired), {code:"INVALID_SCAN_PERMIT"});

    await db.query(`UPDATE customer_scan_limits SET monthly_count=999,
      recent_scans=ARRAY[now()-interval '61 seconds'] WHERE customer_id=$1`,[customer]);
    const monthlyRace = await Promise.allSettled([reserveScan(customer),reserveScan(customer)]);
    assert.equal(monthlyRace.filter(r=>r.status==="fulfilled").length,1);
    const monthlyFailure = monthlyRace.find(r=>r.status==="rejected") as PromiseRejectedResult;
    assert.ok(monthlyFailure.reason instanceof ScanLimitError);
    assert.equal(monthlyFailure.reason.code,"MONTHLY_SCAN_LIMIT");
    assert.ok(monthlyFailure.reason.retryAfter>0);
    assert.equal((await db.query("SELECT monthly_count FROM customer_scan_limits WHERE customer_id=$1",[customer])).rows[0].monthly_count,1000);
    await db.query("UPDATE customer_scan_limits SET month_start=month_start-interval '1 month',recent_scans='{}' WHERE customer_id=$1",[customer]);
    await reserveScan(customer);
    assert.equal((await db.query("SELECT monthly_count FROM customer_scan_limits WHERE customer_id=$1",[customer])).rows[0].monthly_count,1);
    await reserveScan(other);
    assert.equal((await db.query("SELECT monthly_count FROM customer_scan_limits WHERE customer_id=$1",[other])).rows[0].monthly_count,1);
  } finally {
    await db.query("DELETE FROM device_customers WHERE customer_id=ANY($1::text[])",[[customer,other]]);
    await db.end();
  }
});
