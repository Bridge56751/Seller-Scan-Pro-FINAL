import assert from "node:assert/strict";
import { test } from "node:test";
import { createScanReviewTracker, isReviewEligibleScan } from "../shared/barcode-review";

test("requests once after three distinct successful scans, including across launches", async () => {
  let stored: string | null = null;
  let requests = 0;
  const deps = {
    read: async () => stored,
    write: async (value: string) => { stored = value; },
    available: async () => true,
    request: async () => { requests++; },
  };
  const first = createScanReviewTracker(deps);
  await first("one");
  await first("one");
  await first("two");
  assert.equal(requests, 0);
  const next = createScanReviewTracker(deps);
  await Promise.all([next("three"), next("three"), next("four")]);
  assert.equal(requests, 1);
  await createScanReviewTracker(deps)("five");
  assert.equal(requests, 1);
});

test("defers when native review is unavailable", async () => {
  let stored: string | null = null;
  let available = false;
  let requests = 0;
  const track = createScanReviewTracker({
    read: async () => stored,
    write: async value => { stored = value; },
    available: async () => available,
    request: async () => { requests++; },
  });
  for (const id of ["one", "two", "three"]) await track(id);
  assert.equal(requests, 0);
  available = true;
  await track("four");
  assert.equal(requests, 1);
});

test("three successful scans can be any mix of barcode and camera", async () => {
  for (const sources of [
    ["barcode", "photo", "barcode"],
    ["photo", "photo", "photo"],
    ["barcode", "barcode", "barcode"],
  ]) {
    let stored: string | null = null;
    let requests = 0;
    const track = createScanReviewTracker({
      read: async () => stored,
      write: async value => { stored = value; },
      available: async () => true,
      request: async () => { requests++; },
    });
    for (const [index, source] of sources.entries()) {
      const scan = { source, stage: "ready", error: null, result: { offers: [{}] } };
      assert.equal(isReviewEligibleScan(scan), true);
      await track(`scan-${index}`);
      assert.equal(requests, index === 2 ? 1 : 0);
    }
  }
});

test("neither scan type counts errors, cancellation, or empty results", () => {
  for (const source of ["barcode", "photo"]) {
    const scan = { source, stage: "ready", error: null, result: { offers: [{}] } };
    assert.equal(isReviewEligibleScan({ ...scan, stage: "canceled" }), false);
    assert.equal(isReviewEligibleScan({ ...scan, stage: "error", error: "Failed" }), false);
    assert.equal(isReviewEligibleScan({ ...scan, result: { offers: [] } }), false);
  }
});
