import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { Pool } from "pg";
import { randomBytes, createHash } from "node:crypto";
import type { AddressInfo } from "node:net";
import deviceRouter from "../server/routes/device";
import shoppingRouter from "../server/routes/shopping";
import { mockPaidCustomer } from "./billing-fixture";

test("HTTP abuse audit: authenticated paid customers retain independent caps and credentials cannot reset them", async t => {
  mockPaidCustomer(t);
  const db = new Pool({ connectionString: process.env.SUPABASE_DATABASE_URL });
  const hash = (s:string) => createHash("sha256").update(s).digest("hex");
  const ids = [0,1].map(() => `audit_${randomBytes(16).toString("hex")}`);
  const keys = ids.map(() => randomBytes(32).toString("hex"));
  const app = express();
  app.use("/api/shopping",shoppingRouter);
  app.use(express.json(),deviceRouter);
  const server = app.listen(0,"127.0.0.1");
  await new Promise<void>(r=>server.once("listening",r));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const originalFetch = global.fetch;
  let providerCalls = 0;
  global.fetch = async (url,init) => {
    if (new URL(String(url)).hostname === "www.searchapi.io") {
      providerCalls++;
      return Response.json({shopping_results:[]});
    }
    return originalFetch(url,init);
  };
  const headers = (index:number) => ({
    "Content-Type":"application/json","X-Device-Id":ids[index],"X-Device-Key":keys[index],
  });
  const post = (route:string,index:number,body:unknown={},extra:Record<string,string>={}) =>
    originalFetch(`${origin}${route}`, {method:"POST",headers:{...headers(index),...extra},body:JSON.stringify(body)});
  const query = {query:"Water bottle",country:"US"};
  try {
    const first = await post("/api/device/register",0);
    assert.equal(first.status,200);
    const customer = (await first.json()).customerId;
    await db.query(`INSERT INTO customer_scan_limits(customer_id,month_start,monthly_count)
      VALUES($1,date_trunc('month',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC',1000)`,[customer]);
    assert.equal((await post("/api/shopping/search",0,query)).status,429);
    const repeated = await post("/api/device/register",0);
    assert.equal((await repeated.json()).customerId,customer);
    assert.equal((await post("/api/shopping/search",0,query)).status,429,
      "Registering the same device again must not reset its limit");
    assert.equal((await post("/api/shopping/search",0,query,{"X-Device-Key":keys[1]})).status,401);
    assert.equal((await post("/api/device/register",0,{},{"X-Device-Key":keys[1]})).status,401,
      "Register must not overwrite an existing credential");
    assert.equal((await post("/api/shopping/search",1,query)).status,401,"Unregistered IDs must fail");
    assert.equal((await post("/api/shopping/search",0,{...query,customerId:"fake",isPaid:true})).status,400);
    assert.equal((await post("/api/shopping/search?customerId=fake&isPaid=true",0,query)).status,429);
    assert.equal((await post("/api/shopping/search",0,query,{"X-Forwarded-For":"198.51.100.12"})).status,429);
    assert.equal((await post("/api/shopping/search",0,query,{"X-Scan-Permit":randomBytes(16).toString("hex")})).status,409);
    assert.equal(providerCalls,0,"Rejected requests must not reach paid providers");

    // A separate identity has separate counters. This test mocks verified paid
    // access for both; free-user access is covered by free-scan-allowances.test.ts.
    const fresh = await post("/api/device/register",1);
    assert.equal(fresh.status,200);
    assert.notEqual((await fresh.json()).customerId,customer);
    assert.equal((await post("/api/shopping/search",1,query)).status,200,
      "A second verified subscriber has an independent allowance");
    assert.equal(providerCalls,1,"The proof uses a fake provider, never a paid lookup");
    assert.equal((await post("/api/shopping/search",0,query)).status,429);

    const permissions = await db.query(`SELECT c.relname,c.relrowsecurity,
      has_table_privilege('anon',c.oid,'INSERT,UPDATE,DELETE') AS anon_write,
      has_table_privilege('authenticated',c.oid,'INSERT,UPDATE,DELETE') AS user_write
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      WHERE n.nspname='public' AND c.relname IN ('customer_scan_limits','scan_search_permits','device_customers')`);
    assert.equal(permissions.rowCount,3);
    for (const row of permissions.rows) {
      assert.equal(row.relrowsecurity,true);
      assert.equal(row.anon_write,false);
      assert.equal(row.user_write,false);
    }
  } finally {
    global.fetch=originalFetch;
    await new Promise<void>(r=>server.close(()=>r()));
    await db.query("DELETE FROM device_customers WHERE device_hash=ANY($1::text[])",[ids.map(hash)]);
    await db.end();
  }
});
