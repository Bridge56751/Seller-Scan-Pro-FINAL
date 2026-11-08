import test from "node:test";
import assert from "node:assert/strict";
import { createPhotoHistoryStore, PHOTO_HISTORY_KEY, type PhotoScanHistoryItem } from "../lib/photo-scan-history-store";

function setup() {
  const values = new Map<string, string>();
  const storage = {
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => { values.set(key, value); },
  };
  return { values, storage, history: createPhotoHistoryStore(storage) };
}
const item = (id: string, timestamp: number): PhotoScanHistoryItem => ({
  id, timestamp, photoUri: "data:image/jpeg;base64,test", query: "Water bottle",
  matches: [], result: { offers: [], country: "US", currency: "USD", fetchedAt: "2026-11-08T00:00:00Z", excluded: 0, query: "Water bottle", matchStatus: "possible" },
  error: null, condition: "any",
});
test("reading history normalizes older unsorted records to newest first", async () => {
  const { values, history } = setup();
  values.set(PHOTO_HISTORY_KEY, JSON.stringify([item("old", 1), item("new", 2)]));
  assert.deepEqual((await history.list()).map(row => row.id), ["new", "old"]);
});
test("photo history survives store recreation, sorts newest first, and updates without duplicates", async () => {
  const { history, storage } = setup();
  await Promise.all([history.save(item("older", 1)), history.save(item("newer", 2))]);
  const restored = createPhotoHistoryStore(storage);
  assert.deepEqual((await restored.list()).map(row => row.id), ["newer", "older"]);
  await restored.save({ ...item("older", 1), query: "Refined bottle" }, true);
  assert.equal((await restored.list()).length, 2);
  assert.equal((await restored.list())[1].query, "Refined bottle");
  assert.equal((await restored.list())[0].photoUri, "data:image/jpeg;base64,test");
});
test("delete and clear are durable and later refinements cannot restore deleted scans", async () => {
  const { history, storage } = setup();
  await history.save(item("a", 1));
  await history.remove("a");
  await history.save(item("a", 1), true);
  assert.deepEqual(await history.list(), []);
  await history.save(item("b", 2));
  await history.clear();
  await history.save(item("b", 2), true);
  assert.deepEqual(await createPhotoHistoryStore(storage).list(), []);
});
test("history bounds storage to 50 newest scans and retains unsuccessful scans", async () => {
  const { history } = setup();
  await Promise.all(Array.from({ length: 55 }, (_, n) => history.save(item(String(n), n))));
  const rows = await history.list();
  assert.equal(rows.length, 50);
  assert.equal(rows[0].id, "54");
  await history.save({ ...item("failed", 99), result: null, query: "", error: "Search unavailable" });
  assert.equal((await history.list())[0].error, "Search unavailable");
});
test("unreadable storage and failed writes surface errors instead of silently losing history", async () => {
  const { values, history } = setup();
  values.set(PHOTO_HISTORY_KEY, "{broken");
  await assert.rejects(history.list());
  await assert.rejects(history.save(item("a", 1)));
  assert.equal(values.get(PHOTO_HISTORY_KEY), "{broken");
  const failing = createPhotoHistoryStore({ getItem: async () => null, setItem: async () => { throw new Error("Storage full"); } });
  await assert.rejects(failing.save(item("a", 1)), /Storage full/);
});
