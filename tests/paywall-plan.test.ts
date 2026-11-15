import test from "node:test";
import assert from "node:assert/strict";
import { selectProMonthlyPackage } from "../shared/paywall-plan";
import { isPurchaseCancelled } from "../shared/billing-errors";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";

function offering(testMode=false) {
  return {current:{identifier:"200",monthly:{packageType:"MONTHLY",
    product:{identifier:testMode?"monthly":"200",priceString:"€12,49"}}}};
}
test("Paywall selects the exact monthly product and preserves localized price",()=>{
  assert.equal(selectProMonthlyPackage(offering(),false).product.priceString,"€12,49");
  assert.equal(selectProMonthlyPackage(offering(true),true).product.identifier,"monthly");
  assert.throws(()=>selectProMonthlyPackage(offering(true),false));
  assert.throws(()=>selectProMonthlyPackage(offering(),true));
  assert.throws(()=>selectProMonthlyPackage({current:{availablePackages:[offering().current.monthly]}},false));
  assert.throws(()=>selectProMonthlyPackage({current:{...offering().current,monthly:{...offering().current.monthly,packageType:"ANNUAL"}}},false));
});

function clientHarness(testMode=false) {
  let buys=0;
  let restored=0;
  let cancelled=false;
  let offerings:any=offering(testMode);
  const RC={
    configure:async()=>{},getAppUserID:async()=>"live-id",logIn:async()=>{},
    getOfferings:async()=>offerings,
    purchasePackage:async()=>{
      buys++;
      await new Promise(r=>setTimeout(r,5));
      if(cancelled) throw {code:"1"};
      return {customerInfo:{entitlements:{active:{}}}};
    },
    restorePurchases:async()=>{restored++;return {entitlements:{active:{}}};},
  };
  const modules:Record<string,unknown>={
    "react-native":{Platform:{OS:testMode?"web":"ios"}},
    "./query-client":{getApiUrl:()=>"https://example.com"},
    "expo/fetch":{fetch:async()=>Response.json({apiKey:testMode?"test_fixture":"appl_fixture",mode:testMode?"test":"native"})},
    "expo-constants":{__esModule:true,default:{executionEnvironment:testMode?"store":"standalone"},ExecutionEnvironment:{StoreClient:"store"}},
    "./device-client":{registerDevice:async()=>({customerId:"live-id",testCustomerId:"test-id"}),getVerifiedTestStatus:async()=>({hasTestAccess:false})},
    "@/shared/billing-errors":{isPurchaseCancelled},
    "@/shared/paywall-plan":{selectProMonthlyPackage},
    "react-native-purchases":{__esModule:true,default:RC},
  };
  const exports:any={};
  const code=ts.transpileModule(readFileSync("lib/revenuecat.ts","utf8"),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true},
  }).outputText;
  runInNewContext(code,{exports,require:(id:string)=>{if(!(id in modules))throw Error(id);return modules[id];},
    __DEV__:testMode,URL,AbortSignal,console});
  return {client:exports,buys:()=>buys,restores:()=>restored,
    cancel:()=>{cancelled=true;},setOfferings:(value:any)=>{offerings=value;}};
}

test("Native purchase initializes, uses the displayed plan, and rejects double taps",async()=>{
  const h=clientHarness();
  const plan=await h.client.loadProPaywallPlan();
  assert.equal(plan.price,"€12,49");
  assert.equal(plan.mode,"native");
  const [first,second]=await Promise.all([h.client.purchaseSubscription(plan.productId),h.client.purchaseSubscription(plan.productId)]);
  assert.equal(first.success,true);
  assert.equal(second.success,false);
  assert.equal(h.buys(),1);
});
test("Native cancellation is neutral and unavailable plans never purchase",async()=>{
  const h=clientHarness();
  h.cancel();
  assert.equal((await h.client.purchaseSubscription("200")).error,"cancelled");
  h.setOfferings({current:null});
  assert.equal((await h.client.purchaseSubscription("200")).success,false);
  assert.equal(h.buys(),1);
});
test("Native restore initializes without needing to load the paywall price",async()=>{
  const h=clientHarness();
  assert.equal((await h.client.restorePurchases()).success,true);
  assert.equal(h.restores(),1);
});
test("Preview plan stays in Test Store and cannot invoke native purchase",async()=>{
  const h=clientHarness(true);
  assert.equal((await h.client.loadProPaywallPlan()).mode,"test");
  assert.equal((await h.client.purchaseSubscription("monthly")).success,false);
  assert.equal(h.buys(),0);
});
