import test from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { ReplitConnectors } from "@replit/connectors-sdk";
import { reserveScan, scanAllowances } from "../server/services/scan-rate-limits";
import { verifyRevenueCat } from "../server/services/verify-revenuecat";
import express from "express";
import type { AddressInfo } from "node:net";
import sharp from "sharp";
import shoppingRouter from "../server/routes/shopping";
import deviceRouter from "../server/routes/device";

test("one-time free allowances are separate, atomic, persistent, and fail closed",async t => {
  let mode: "free"|"paid"|"test"|"apple"|"failure" = "free";
  let billingCalls=0;
  t.mock.method(ReplitConnectors.prototype,"proxy",async () => {
    billingCalls++;
    if(mode==="failure") return new Response(null,{status:503});
    if(mode==="free") return new Response(null,{status:404});
    return Response.json({items:[{environment:mode==="paid"?"production":"sandbox",
      store:mode==="paid"||mode==="apple"?"app_store":"test_store",gives_access:true,
      current_period_ends_at:Date.now()+3600000,
      entitlements:{items:[{id:process.env.REVENUECAT_PRO_ENTITLEMENT_ID}]}}]});
  });
  const db=new Pool({connectionString:process.env.SUPABASE_DATABASE_URL});
  const id=`free_test_${randomUUID()}`;
  try {
    await db.query("INSERT INTO device_customers(device_hash,credential_hash,customer_id,test_customer_id) VALUES($1,$2,$1,$3)",[id,"a".repeat(64),`${id}_test`]);
    const attempts=await Promise.allSettled(Array.from({length:8},()=>reserveScan(id,true,undefined,"photo")));
    const accepted=attempts.filter(r=>r.status==="fulfilled");
    assert.equal(accepted.length,1);
    for(const denied of attempts.filter(r=>r.status==="rejected")) assert.equal(denied.reason.code,"SUBSCRIPTION_REQUIRED");
    assert.equal(billingCalls,2,"Concurrent scan checks share one lookup per Apple environment");
    const photoPermit=accepted[0].value.scanPermit!;
    assert.deepEqual(await scanAllowances(id),{freePhotoScansLeft:0,freeBarcodeScansLeft:1,scanCount:1});
    const barcode=await reserveScan(id,true,undefined,"barcode");
    assert.equal(billingCalls,2,"Barcode uses the cached verification");
    await assert.rejects(reserveScan(id,true,undefined,"barcode"),{code:"SUBSCRIPTION_REQUIRED"});
    await assert.rejects(reserveScan(id),{code:"SUBSCRIPTION_REQUIRED"});
    await reserveScan(id,false,photoPermit);
    await reserveScan(id,false,barcode.scanPermit);
    await assert.rejects(reserveScan(id,false,barcode.scanPermit),{code:"INVALID_SCAN_PERMIT"});
    assert.deepEqual(await scanAllowances(id),{freePhotoScansLeft:0,freeBarcodeScansLeft:0,scanCount:2});
    await db.query("UPDATE customer_scan_limits SET month_start=month_start-interval '1 month',recent_scans='{}' WHERE customer_id=$1",[id]);
    await assert.rejects(reserveScan(id,true,undefined,"photo"),{code:"SUBSCRIPTION_REQUIRED"},"Monthly reset must not reset lifetime free usage");

    mode="test";
    await verifyRevenueCat(id,false,true);
    await assert.rejects(reserveScan(id,true,undefined,"photo"),{code:"SUBSCRIPTION_REQUIRED"},"Test Store never unlocks scans");
    mode="apple";
    await verifyRevenueCat(id,"apple-sandbox",true);
    const apple=await reserveScan(id,true,undefined,"barcode");
    await reserveScan(id,false,apple.scanPermit);
    await assert.rejects(reserveScan(id,false,apple.scanPermit),{code:"INVALID_SCAN_PERMIT"});
    await db.query("UPDATE customer_scan_limits SET monthly_count=1000 WHERE customer_id=$1",[id]);
    await assert.rejects(reserveScan(id),{code:"MONTHLY_SCAN_LIMIT"},"Apple sandbox has the same cap");
    await db.query("UPDATE customer_scan_limits SET monthly_count=3,recent_scans='{}' WHERE customer_id=$1",[id]);
    mode="free";
    await verifyRevenueCat(id,"apple-sandbox",true);
    mode="paid";
    await verifyRevenueCat(id,false,true);
    await reserveScan(id,true,undefined,"photo");
    await reserveScan(id,true,undefined,"barcode");
    await reserveScan(id);
    assert.equal((await scanAllowances(id)).freePhotoScansLeft,0);
    mode="free";
    await verifyRevenueCat(id,false,true);
    await assert.rejects(reserveScan(id,true,undefined,"photo"),{code:"SUBSCRIPTION_REQUIRED"},"Expired access must not reset the free allowance");
    mode="failure";
    await assert.rejects(verifyRevenueCat(id,false,true));
    const before=await scanAllowances(id);
    await assert.rejects(reserveScan(id,true,undefined,"barcode"),{code:"BILLING_UNAVAILABLE"});
    assert.deepEqual(await scanAllowances(id),before,"Verification failure consumes no allowance");
  } finally {
    await db.query("DELETE FROM device_customers WHERE customer_id=$1",[id]);
    await db.end();
  }
});

test("HTTP free scan enforcement covers photo, barcode, price lookup, and legacy recording",async t => {
  t.mock.method(ReplitConnectors.prototype,"proxy",async()=>new Response(null,{status:404}));
  const db=new Pool({connectionString:process.env.SUPABASE_DATABASE_URL});
  const device=`free_http_${randomUUID()}`;
  const key=randomBytes(32).toString("hex");
  const hash=(s:string)=>createHash("sha256").update(s).digest("hex");
  const app=express();
  app.use("/api/shopping",shoppingRouter);
  app.use(express.json(),deviceRouter);
  const server=app.listen(0,"127.0.0.1");
  await new Promise<void>(r=>server.once("listening",r));
  const root=`http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const originalFetch=global.fetch;
  let providerCalls=0;
  global.fetch=async(url,init)=>{
    const target=new URL(String(url));
    if(target.hostname==="www.searchapi.io") {
      providerCalls++;
      return Response.json(target.searchParams.get("engine")==="google_lens" ?
        {visual_matches:[{title:"Water bottle",source:"Fixture"}]} : {shopping_results:[]});
    }
    if(target.hostname==="api.upcitemdb.com"){
      providerCalls++;
      return Response.json({code:"OK",items:[{upc:"036000291452",title:"Water bottle"}]});
    }
    return originalFetch(url,init);
  };
  const post=(path:string,body:unknown={},permit?:string)=>originalFetch(`${root}${path}`,{
    method:"POST",headers:{"Content-Type":"application/json","X-Device-Id":device,"X-Device-Key":key,
      ...(permit?{"X-Scan-Permit":permit}:{})},body:JSON.stringify(body)});
  try {
    assert.equal((await post("/api/device/register")).status,200);
    const image=(await sharp({create:{width:16,height:16,channels:3,background:"white"}}).jpeg().toBuffer()).toString("base64");
    const photo=await post("/api/shopping/identify",{image,country:"US"});
    assert.equal(photo.status,200);
    const photoPermit=(await photo.json()).scanPermit;
    assert.equal((await post("/api/shopping/search",{query:"Water bottle",country:"US"},photoPermit)).status,200);
    const afterPhoto=providerCalls;
    assert.equal((await post("/api/shopping/identify",{image,country:"US"})).status,402);
    assert.equal(providerCalls,afterPhoto);
    const barcode=await post("/api/shopping/barcode",{barcode:"036000291452"});
    assert.equal(barcode.status,200);
    const barcodePermit=(await barcode.json()).scanPermit;
    assert.equal((await post("/api/shopping/search",{query:"Water bottle",country:"US"},barcodePermit)).status,200);
    const afterBoth=providerCalls;
    assert.equal((await post("/api/shopping/barcode",{barcode:"036000291452"})).status,402);
    assert.equal((await post("/api/shopping/search",{query:"Water bottle",country:"US"})).status,402);
    assert.equal((await post("/api/shopping/compare",{product:"Water bottle",country:"US",size:"N/A",color:"N/A",quantity:1,condition:"new",confirmed:true})).status,402);
    assert.equal((await post("/api/shopping/search",{query:"Water bottle",country:"US"},barcodePermit)).status,409);
    assert.equal((await post("/api/device/record-scan",{isPaid:true})).status,410);
    assert.equal(providerCalls,afterBoth);
    const status=await (await post("/api/device/status")).json();
    assert.equal(status.freePhotoScansLeft,0);
    assert.equal(status.freeBarcodeScansLeft,0);
    assert.equal(status.scanCount,2);
    assert.equal(status.isPaid,false);
  } finally {
    global.fetch=originalFetch;
    await new Promise<void>(r=>server.close(()=>r()));
    await db.query("DELETE FROM device_customers WHERE device_hash=$1",[hash(device)]);
    await db.end();
  }
});
