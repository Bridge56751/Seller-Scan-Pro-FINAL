import test from "node:test";
import assert from "node:assert/strict";
import { isPurchaseCancelled } from "../shared/billing-errors";

test("Native and Web Test Store cancellations are recognized", () => {
  for (const error of [{ userCancelled: true }, { code: "1" }, { code: 1, userCancelled: false }, { errorCode: 1 }, { errorCode: "1" }]) {
    assert.equal(isPurchaseCancelled(error), true);
  }
});
test("Provider failures and unrecognized errors are not dismissed as cancellations", () => {
  for (const error of [null, undefined, "cancelled", { errorCode: 2 }, { code: "2" }, new Error("network"), { userCancelled: false }]) {
    assert.equal(isPurchaseCancelled(error), false);
  }
});
