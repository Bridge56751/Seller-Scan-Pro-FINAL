import test from "node:test";
import assert from "node:assert/strict";
import { subscriptionAccess } from "../shared/purchase-verification";

const now = 1000000;
const valid = {environment:"production",store:"app_store",gives_access:true,
  current_period_ends_at:now+60000,ends_at:now+60000,
  entitlements:{items:[{id:"seller-pro"}]}};
test("Only a current RevenueCat Apple subscription with the exact entitlement grants production access",()=>{
  assert.equal(subscriptionAccess([valid],"seller-pro","production",now).hasAccess,true);
  for(const override of [
    {gives_access:false},{environment:"sandbox"},{store:"test_store"},
    {store:"play_store"},{current_period_ends_at:now-1},{ends_at:now-1},
    {entitlements:{items:[{id:"other-pro"}]}},{current_period_ends_at:null},
  ]) assert.equal(subscriptionAccess([{...valid,...override}],"seller-pro","production",now).hasAccess,false);
  assert.equal(subscriptionAccess([],"seller-pro","production",now).hasAccess,false);
});
test("Test Store receipts cannot unlock production; Apple sandbox receipts cannot impersonate Test Store",()=>{
  const sandbox={...valid,store:"test_store",environment:"sandbox"};
  assert.equal(subscriptionAccess([sandbox],"seller-pro","sandbox",now).hasAccess,true);
  assert.equal(subscriptionAccess([sandbox],"seller-pro","production",now).hasAccess,false);
  assert.equal(subscriptionAccess([{...sandbox,store:"app_store"}],"seller-pro","sandbox",now).hasAccess,false);
  assert.equal(subscriptionAccess([valid],"seller-pro","sandbox",now).hasAccess,false);
});
test("Cancellation of auto-renewal does not revoke an already-paid current period",()=>{
  assert.equal(subscriptionAccess([{...valid,auto_renewal_status:"will_not_renew"}],"seller-pro","production",now).hasAccess,true);
});
