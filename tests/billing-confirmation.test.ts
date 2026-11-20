import test from "node:test";
import assert from "node:assert/strict";
import { confirmPurchaseAccess, hasVerifiedScanAccess } from "../shared/billing-confirmation";

const denied={isPaid:false,hasTestScanAccess:false};
test("accepts server verified Apple sandbox access without labelling it paid",async()=>{
  const value={...denied,hasTestScanAccess:true};
  assert.equal(await confirmPurchaseAccess(async()=>value),value);
  assert.equal(value.isPaid,false);
  assert.equal(hasVerifiedScanAccess(value),true);
});
test("retries delayed verification, not purchasing",async()=>{
  let reads=0;
  const waits:number[]=[];
  const value=await confirmPurchaseAccess(async()=>++reads<3 ? denied : {...denied,isPaid:true},
    async ms=>{waits.push(ms);});
  assert.equal(value.isPaid,true);
  assert.equal(reads,3);
  assert.deepEqual(waits,[1000,2000]);
});
test("never grants access when verification stays negative or fails",async()=>{
  assert.equal(await confirmPurchaseAccess(async()=>denied,async()=>{}),denied);
  await assert.rejects(confirmPurchaseAccess(async()=>{throw new Error("offline");},async()=>{}),/offline/);
});
test("a late network failure cannot return earlier status as verified",async()=>{
  let calls=0;
  await assert.rejects(confirmPurchaseAccess(async()=>{
    if(++calls>1)throw new Error("offline");
    return denied;
  },async()=>{}),/offline/);
});
