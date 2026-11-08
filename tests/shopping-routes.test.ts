import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import type { AddressInfo } from "node:net";
import shopping from "../server/routes/shopping";

test("API guardrails reject invalid input without transmitting photos or searching", async () => {
  const app = express();
  app.use("/api/shopping", shopping);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  const root = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/shopping`;
  const body = { product: "Sony WH-1000XM5", size: "N/A", color: "Black", quantity: 1, condition: "new", country: "US", confirmed: true };
  const post = (route: string, payload: unknown) => fetch(`${root}/${route}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  try {
    assert.equal((await post("identify", { image: "!".repeat(120), country: "US" })).status, 400);
    assert.equal((await post("compare", { ...body, confirmed: false })).status, 400);
    assert.equal((await post("search", { query: "", country: "US" })).status, 400);
    assert.equal((await post("search", { query: "Bottle", country: "US", confirmed: true })).status, 400);
    assert.equal((await post("search", { query: "Bottle", country: "ZZ" })).status, 422);
    const unsupported = await post("compare", { ...body, country: "ZZ" });
    assert.equal(unsupported.status, 422);
    assert.equal((await unsupported.json()).code, "REGION_UNAVAILABLE");
    assert.equal((await fetch(`${root}/photo/not-a-token`)).status, 404);
    assert.equal((await post("compare", { ...body, product: "A".repeat(9000) })).status, 413);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); }
});
