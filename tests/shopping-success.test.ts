import test from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";
import { randomBytes, createHash } from "node:crypto";
import type { AddressInfo } from "node:net";
import express from "express";
import sharp from "sharp";

test("authenticated photo identification uses private storage and cleans up success and cancellation", async () => {
  const deviceId = `test_${randomBytes(16).toString("hex")}`;
  const key = randomBytes(32).toString("hex");
  const hash = (s: string) => createHash("sha256").update(s).digest("hex");
  const db = new Pool({ connectionString: process.env.SUPABASE_DATABASE_URL });
  await db.query(`INSERT INTO device_customers(device_hash,credential_hash,customer_id,test_customer_id)
    VALUES($1,$2,$3,$4)`, [hash(deviceId),hash(key),deviceId,`${deviceId}_test`]);
  const headers = { "Content-Type": "application/json", "X-Device-Id": deviceId, "X-Device-Key": key };
  const { default: shopping } = await import("../server/routes/shopping");
  const app = express();
  app.use("/api/shopping", shopping);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const originalFetch = global.fetch;
  let imageFetched = false;
  const searchedConditions: Array<string | null> = [];
  let imagePath = "";
  global.fetch = async (url, init) => {
    const target = new URL(String(url));
    if (target.hostname !== "www.searchapi.io") return originalFetch(url, init);
    if (target.searchParams.get("engine") === "google_lens") {
      assert.equal(target.searchParams.get("search_type"), "visual_matches");
      imagePath = target.searchParams.get("url")!;
      const response = await originalFetch(imagePath);
      assert.equal(response.status, 200);
      const bytes = Buffer.from(await response.arrayBuffer());
      const meta = await sharp(bytes).metadata();
      assert.equal(meta.format, "jpeg");
      assert.equal(meta.exif, undefined);
      imageFetched = true;
      return Response.json({ visual_matches: [{ title: "Sony WH-1000XM5 Black", source: "Fixture retailer" }] });
    }
    assert.match(target.searchParams.get("q")!, /Sony WH-1000XM5 Black/);
    assert.equal(target.searchParams.get("gl"), "us");
    assert.equal(target.searchParams.get("link"), "raw");
    searchedConditions.push(target.searchParams.get("condition"));
    return Response.json({ shopping_results: [{
      title: "Sony WH-1000XM5 Black", seller: "Fixture retailer", price: "$299",
      extracted_price: 299, product_link: "https://example.com/item",
    }] });
  };
  try {
    const image = await sharp({ create: { width: 20, height: 20, channels: 3, background: "blue" } }).jpeg().toBuffer();
    const post = (route: string, body: unknown, permit?: string) => originalFetch(`${origin}/api/shopping/${route}`, {
      method: "POST", headers: {...headers,...(permit ? {"X-Scan-Permit":permit} : {})},
      body: JSON.stringify(body),
    });
    const invalid = await post("identify", { image: image.toString("base64"), country: "invalid" });
    assert.equal(invalid.status, 400);
    assert.equal(imageFetched, false, "invalid requests must not send the photo to a provider");
    const unauthorized = await originalFetch(`${origin}/api/shopping/identify`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: image.toString("base64"), country: "US" }),
    });
    assert.equal(unauthorized.status, 401);
    assert.equal(imageFetched, false);
    const identified = await post("identify", { image: image.toString("base64"), country: "US" });
    assert.equal(identified.status, 200);
    const matches = await identified.json();
    assert.equal(matches.matches[0].title, "Sony WH-1000XM5 Black");
    assert.equal(imageFetched, true);
    // Cleanup follows the response; wait for completion rather than assuming socket timing.
    for (let n = 0; n < 20; n++) {
      const result = await db.query("SELECT count(*)::int AS count FROM storage.objects WHERE bucket_id='temporary-scan-photos' AND name=$1",
        [new URL(imagePath).pathname.split("/").at(-1)]);
      if (result.rows[0].count === 0) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.equal((await originalFetch(imagePath)).ok, false);
    // A visual suggestion can search immediately without pretending the user confirmed a variant.
    const suggested = await post("search", { query: matches.matches[0].title, country: "US" }, matches.scanPermit);
    assert.equal(suggested.status, 200);
    const suggestions = await suggested.json();
    assert.equal(suggestions.matchStatus, "possible");
    assert.equal(suggestions.query, matches.matches[0].title);
    assert.equal(suggestions.offers[0].amount, 299);
    assert.equal((await db.query("SELECT monthly_count FROM customer_scan_limits WHERE customer_id=$1",[deviceId])).rows[0].monthly_count,1,
      "Identification and follow-up price lookup count as one scan");
    assert.equal((await post("search", {query:matches.matches[0].title,country:"US"}, matches.scanPermit)).status,409);
    assert.equal(searchedConditions.at(-1), null, "photo search must not silently assume new condition");
    const refined = await post("search", { query: matches.matches[0].title, country: "US", condition: "used" });
    assert.equal(refined.status, 200);
    assert.equal(searchedConditions.at(-1), "used");
    const compared = await post("compare", {
      product: matches.matches[0].title, size: "N/A", color: "N/A", quantity: 1, condition: "new", country: "US", confirmed: true,
    });
    assert.equal(compared.status, 200);
    assert.equal((await compared.json()).offers[0].amount, 299);

    // Cancel real HTTP requests after the provider starts. No paid requests are made.
    for (const stage of ["identify", "search"] as const) {
      let providerStarted!: () => void;
      let providerAborted!: () => void;
      const started = new Promise<void>(resolve => { providerStarted = resolve; });
      const aborted = new Promise<void>(resolve => { providerAborted = resolve; });
      let providerCalls = 0;
      global.fetch = async (url, init) => {
        if (new URL(String(url)).hostname !== "www.searchapi.io") return originalFetch(url, init);
        if (stage === "identify") imagePath = new URL(String(url)).searchParams.get("url")!;
        providerCalls++;
        assert.equal(init!.signal!.aborted, false);
        providerStarted();
        return new Promise((_resolve, reject) => init!.signal!.addEventListener("abort", () => {
          providerAborted();
          reject(new DOMException("Canceled", "AbortError"));
        }));
      };
      const controller = new AbortController();
      const pending = originalFetch(`${origin}/api/shopping/${stage}`, {
        method: "POST",
        headers,
        body: JSON.stringify(stage === "identify" ? { image: image.toString("base64"), country: "US" } :
          { query: "Stanley Quencher H2.0 FlowState 40 oz insulated stainless steel travel tumbler", country: "US", automatic: true }),
        signal: controller.signal,
      });
      const rejected = assert.rejects(pending, { name: "AbortError" });
      await started;
      controller.abort();
      await rejected;
      await Promise.race([aborted, new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error("Provider did not abort after disconnect")), 2000);
        timer.unref();
      })]);
      for (let n = 0; n < 40; n++) {
        const remaining = await db.query("SELECT count(*)::int AS count FROM storage.objects WHERE bucket_id='temporary-scan-photos' AND name=$1",
          [new URL(imagePath).pathname.split("/").at(-1)]);
        if (remaining.rows[0].count === 0) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      assert.equal((await db.query("SELECT count(*)::int AS count FROM storage.objects WHERE bucket_id='temporary-scan-photos' AND name=$1",
        [new URL(imagePath).pathname.split("/").at(-1)])).rows[0].count, 0);
      assert.equal(providerCalls, 1, "disconnect must not launch a fallback");
    }
    // Reject over-limit calls on every provider route, before touching any provider.
    await db.query("UPDATE customer_scan_limits SET monthly_count=1000 WHERE customer_id=$1",[deviceId]);
    let overLimitCalls = 0;
    global.fetch = async (url,init) => {
      if (new URL(String(url)).hostname !== "127.0.0.1") overLimitCalls++;
      return originalFetch(url,init);
    };
    for (const [route,body] of [
      ["identify",{image:image.toString("base64"),country:"US"}],
      ["barcode",{barcode:"036000291452"}],
      ["search",{query:"Water bottle",country:"US"}],
      ["compare",{product:"Water bottle",size:"N/A",color:"N/A",quantity:1,condition:"new",country:"US",confirmed:true}],
    ] as const) {
      const blocked = await post(route,body);
      assert.equal(blocked.status,429);
      assert.ok(Number(blocked.headers.get("retry-after"))>0);
      assert.equal((await blocked.json()).code,"MONTHLY_SCAN_LIMIT");
    }
    assert.equal(overLimitCalls,0);
  } finally {
    global.fetch = originalFetch;
    await new Promise<void>(resolve => server.close(() => resolve()));
    await db.query("DELETE FROM device_customers WHERE device_hash=$1", [hash(deviceId)]);
    await db.end();
  }
});
