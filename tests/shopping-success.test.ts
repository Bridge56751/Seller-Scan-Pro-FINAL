import test from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";
import { randomBytes } from "node:crypto";
import type { AddressInfo } from "node:net";
import express from "express";
import sharp from "sharp";

test("fresh schema supports identification, image fetch, cleanup and confirmed comparison", async () => {
  const schema = `shopping_test_${randomBytes(8).toString("hex")}`;
  const db = new Pool({ connectionString: process.env.DATABASE_URL });
  // The identifier is generated locally from hex, never from user input.
  await db.query(`CREATE SCHEMA ${schema}`);
  await db.query(`CREATE TABLE ${schema}.shopping_photos (id text PRIMARY KEY, payload text NOT NULL, expires_at timestamptz NOT NULL)`);
  const priorOptions = process.env.PGOPTIONS;
  process.env.PGOPTIONS = `-c search_path=${schema}`;
  const { default: shopping } = await import("../server/routes/shopping");
  const app = express();
  app.use("/api/shopping", shopping);
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const originalFetch = global.fetch;
  let imageFetched = false;
  let imagePath = "";
  global.fetch = async (url, init) => {
    const target = new URL(String(url));
    if (target.hostname !== "www.searchapi.io") return originalFetch(url, init);
    if (target.searchParams.get("engine") === "google_lens") {
      assert.equal(target.searchParams.get("search_type"), "visual_matches");
      imagePath = new URL(target.searchParams.get("url")!).pathname;
      const response = await originalFetch(`${origin}${imagePath}`);
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
    return Response.json({ shopping_results: [{
      title: "Sony WH-1000XM5 Black", seller: "Fixture retailer", price: "$299",
      extracted_price: 299, product_link: "https://example.com/item",
    }] });
  };
  try {
    const image = await sharp({ create: { width: 20, height: 20, channels: 3, background: "blue" } }).jpeg().toBuffer();
    const post = (route: string, body: unknown) => originalFetch(`${origin}/api/shopping/${route}`, {
      method: "POST", headers: { "Content-Type": "application/json", "X-Forwarded-Host": process.env.REPLIT_DEV_DOMAIN! },
      body: JSON.stringify(body),
    });
    const invalid = await post("identify", { image: image.toString("base64"), country: "invalid" });
    assert.equal(invalid.status, 400);
    assert.equal(imageFetched, false, "invalid requests must not send the photo to a provider");
    const identified = await post("identify", { image: image.toString("base64"), country: "US" });
    assert.equal(identified.status, 200);
    const matches = await identified.json();
    assert.equal(matches.matches[0].title, "Sony WH-1000XM5 Black");
    assert.equal(imageFetched, true);
    // Cleanup follows the response; wait for completion rather than assuming socket timing.
    for (let n = 0; n < 20; n++) {
      const result = await db.query(`SELECT count(*)::int AS count FROM ${schema}.shopping_photos`);
      if (result.rows[0].count === 0) break;
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    assert.equal((await originalFetch(`${origin}${imagePath}`)).status, 404);
    const compared = await post("compare", {
      product: matches.matches[0].title, size: "N/A", color: "N/A", quantity: 1, condition: "new", country: "US", confirmed: true,
    });
    assert.equal(compared.status, 200);
    assert.equal((await compared.json()).offers[0].amount, 299);
  } finally {
    global.fetch = originalFetch;
    if (priorOptions === undefined) delete process.env.PGOPTIONS; else process.env.PGOPTIONS = priorOptions;
    await new Promise<void>(resolve => server.close(() => resolve()));
    await db.query(`DROP SCHEMA ${schema} CASCADE`);
    await db.end();
  }
});
