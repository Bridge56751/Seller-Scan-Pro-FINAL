import test from "node:test";
import assert from "node:assert/strict";
import { normalizeBarcode } from "../shared/barcode";
import { createBarcodeLookup, normalizeBarcodeProduct } from "../server/services/barcode-lookup";

const code = "036000291452";
const fixture = { code: "OK", items: [{
  upc: code, ean: `0${code}`, title: "Test Paper", brand: "Test",
  images: ["https://m.media-amazon.com/p.jpg", "https://example.com/p.jpg"],
}] };

test("product barcodes validate checksum and normalize iOS UPC-A", () => {
  assert.equal(normalizeBarcode(code), code);
  assert.equal(normalizeBarcode(`0${code}`), code);
  assert.equal(normalizeBarcode("96385074"), "96385074");
  assert.equal(normalizeBarcode("10012345000017"), "10012345000017");
  for (const value of ["", "https://example.com", "00000000", "036000291453", "1234", "03600029145x"]) {
    assert.equal(normalizeBarcode(value), null);
  }
});
test("lookup only accepts the requested identity and keeps removed image hosts blocked", () => {
  const product = normalizeBarcodeProduct(fixture, code);
  assert.equal(product.title, "Test Paper");
  assert.equal(product.query, "Test Paper");
  assert.equal(product.imageUrl, "https://example.com/p.jpg");
  assert.throws(() => normalizeBarcodeProduct(fixture, "4006381333931"), { code: "BARCODE_NOT_FOUND" });
  assert.throws(() => normalizeBarcodeProduct({ items: [] }, code), { code: "BARCODE_NOT_FOUND" });
});
test("free lookup endpoint caches identity and normalizes equivalent barcodes", async () => {
  let calls = 0;
  const lookup = createBarcodeLookup(async (url) => {
    calls++;
    assert.equal(String(url), `https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`);
    return Response.json(fixture);
  });
  await lookup(code);
  await lookup(`0${code}`);
  assert.equal(calls, 1);
});
test("rate limits, unavailable provider, and empty results fail explicitly", async () => {
  for (const [status, expected] of [[429, "BARCODE_LIMIT"], [503, "BARCODE_UNAVAILABLE"]] as const) {
    const lookup = createBarcodeLookup(async () => new Response("private provider detail", { status }));
    await assert.rejects(lookup(code), (error: any) => error.code === expected && !error.message.includes("private"));
  }
  await assert.rejects(createBarcodeLookup(async () => Response.json({ code: "OK", items: [] }))(code),
    { code: "BARCODE_NOT_FOUND" });
});
test("invalid or canceled lookup makes no provider request", async () => {
  let calls = 0;
  const lookup = createBarcodeLookup(async () => { calls++; return Response.json(fixture); });
  await assert.rejects(lookup("invalid"), { code: "INVALID_BARCODE" });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(lookup(code, controller.signal), { name: "AbortError" });
  assert.equal(calls, 0);
});
test("cancellation propagates to an in-flight barcode request", async () => {
  const controller = new AbortController();
  let received: AbortSignal | undefined;
  const lookup = createBarcodeLookup(async (_url, init) => {
    received = init?.signal as AbortSignal;
    return new Promise((_resolve, reject) => received!.addEventListener("abort",
      () => reject(new DOMException("Canceled", "AbortError"))));
  });
  const pending = lookup(code, controller.signal);
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
  assert.equal(received?.aborted, true);
});
