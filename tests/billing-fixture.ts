import type { TestContext } from "node:test";
import { ReplitConnectors } from "@replit/connectors-sdk";

// No real purchases or RevenueCat requests in scan enforcement tests.
export function mockPaidCustomer(t: TestContext) {
  t.mock.method(ReplitConnectors.prototype,"proxy",async () => Response.json({items:[{
    environment:"production",store:"app_store",gives_access:true,
    current_period_ends_at:Date.now()+3600000,
    entitlements:{items:[{id:process.env.REVENUECAT_PRO_ENTITLEMENT_ID}]},
  }]}));
}
