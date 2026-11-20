import assert from "node:assert/strict";
import { test } from "node:test";
import { createBarcodeReviewTracker } from "../shared/barcode-review";

test("requests once after three distinct successful scans, including across launches", async () => {
  let stored: string | null = null;
  let requests = 0;
  const deps = {
    read: async () => stored,
    write: async (value: string) => { stored = value; },
    available: async () => true,
    request: async () => { requests++; },
  };
  const first = createBarcodeReviewTracker(deps);
  await first("one");
  await first("one");
  await first("two");
  assert.equal(requests, 0);
  const next = createBarcodeReviewTracker(deps);
  await Promise.all([next("three"), next("three"), next("four")]);
  assert.equal(requests, 1);
  await createBarcodeReviewTracker(deps)("five");
  assert.equal(requests, 1);
});

test("defers when native review is unavailable", async () => {
  let stored: string | null = null;
  let available = false;
  let requests = 0;
  const track = createBarcodeReviewTracker({
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
