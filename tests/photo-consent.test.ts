import { test } from "node:test";
import assert from "node:assert/strict";
import { createPhotoConsent } from "../shared/photo-consent";

test("asks once and persists acceptance across launches", async () => {
  let value: string | null = null;
  let prompts = 0;
  const deps = {
    read: async () => value,
    write: async () => { value = "accepted"; },
    ask: async () => { prompts++; return true; },
  };
  const consent = createPhotoConsent(deps);
  assert.deepEqual(await Promise.all([consent(), consent()]), [true, true]);
  assert.equal(await createPhotoConsent(deps)(), true);
  assert.equal(prompts, 1);
});
test("declining does not grant consent and permits a later choice", async () => {
  let accept = false;
  let writes = 0;
  const consent = createPhotoConsent({
    read: async () => null,
    write: async () => { writes++; },
    ask: async () => accept,
  });
  assert.equal(await consent(), false);
  assert.equal(writes, 0);
  accept = true;
  assert.equal(await consent(), true);
  assert.equal(writes, 1);
});
test("storage failure never grants consent", async () => {
  const consent = createPhotoConsent({
    read: async () => null,
    ask: async () => true,
    write: async () => { throw new Error("storage unavailable"); },
  });
  await assert.rejects(consent(), /storage unavailable/);
});
