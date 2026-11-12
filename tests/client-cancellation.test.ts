import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { throwIfCanceled } from "../shared/cancellation";
import { photoSearchQueries } from "../shared/photo-search-query";

// Run the real mobile modules with native I/O and hooks replaced, not their logic.
function load(path: string, modules: Record<string, unknown>) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  runInNewContext(code, { exports, require: (name: string) => {
    if (!(name in modules)) throw new Error(`Missing test module ${name}`);
    return modules[name];
  }, AbortController, console, setTimeout, clearTimeout, URL, Date, Error, TypeError, fetch: (...args: Parameters<typeof fetch>) => fetch(...args) });
  return exports as any;
}
function deferred<T = any>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
function sessionHarness() {
  const hooks: any[] = [];
  let index = 0;
  const identified: ReturnType<typeof deferred>[] = [];
  const searched: ReturnType<typeof deferred>[] = [];
  const signals: AbortSignal[] = [];
  const saved: any[] = [];
  const module = load("lib/scan-session.tsx", {
    react: {
      createContext: () => ({ Provider: "provider" }),
      useEffect: () => {},
      useRef: (value: unknown) => hooks[index++] ??= { current: value },
      useState: (value: unknown) => {
        const key = index++;
        if (!(key in hooks)) hooks[key] = value;
        return [hooks[key], (next: any) => { hooks[key] = typeof next === "function" ? next(hooks[key]) : next; }];
      },
    },
    "react/jsx-runtime": { jsx: (_type: unknown, props: unknown) => props },
    "react-native": { Platform: { OS: "ios" } },
    "./native-camera": { captureProductPhoto: async () => ({ status: "captured", uri: "file:///photo.jpg" }) },
    "./shopping-client": {
      identifyPhoto: (_uri: string, _country: string, signal: AbortSignal) => {
        signals.push(signal); const d = deferred(); identified.push(d); return d.promise;
      },
      searchListings: (_input: unknown, signal: AbortSignal) => {
        signals.push(signal); const d = deferred(); searched.push(d); return d.promise;
      },
    },
    "expo-image-manipulator": { SaveFormat: { JPEG: "jpeg" }, manipulateAsync: async () => ({ base64: "thumbnail", uri: "file:///thumbnail" }) },
    "expo-crypto": { randomUUID: () => `scan-${identified.length}` },
    "./photo-scan-history": { photoScanHistory: { save: async (item: unknown) => saved.push(item) } },
    "@/shared/photo-search-query": { photoSearchQueries },
    "./temporary-photo": { discardTemporaryPhoto: () => {} },
  });
  const view = () => { index = 0; return module.ScanSessionProvider({ children: null }).value; };
  return { view, identified, searched, saved, signals };
}

test("cancel identification, immediately recapture, and ignore old success/finally", async () => {
  const h = sessionHarness();
  await h.view().capture();
  assert.equal(h.view().session.stage, "identifying");
  h.view().cancel();
  assert.equal(h.signals[0].aborted, true);
  assert.equal(h.view().busy, false);
  await h.view().capture();
  h.identified[0].resolve({ matches: [{ title: "Old product" }] });
  await flush();
  assert.equal(h.searched.length, 0, "late identification must not start shopping");
  assert.equal(h.saved.length, 0);
  assert.equal(h.view().busy, true, "old finally cannot unlock new scan");
  assert.equal(await h.view().capture(), false);
  h.identified[1].resolve({ matches: [{ title: "New product" }] });
  await flush();
  h.searched[0].resolve({ query: "New product", offers: [] });
  await flush();
  assert.equal(h.view().session.query, "New product");
  assert.equal(h.saved.length, 1);
  assert.equal(h.saved[0].query, "New product");
});

test("cancel listing search and ignore late rejection while new scan runs", async () => {
  const h = sessionHarness();
  await h.view().capture();
  h.identified[0].resolve({ matches: [{ title: "First product" }] });
  await flush();
  assert.equal(h.view().session.stage, "searching");
  h.view().cancel();
  assert.equal(h.signals[1].aborted, true);
  await h.view().capture();
  h.searched[0].reject(new Error("old timeout"));
  await flush();
  assert.equal(h.view().session.stage, "identifying");
  assert.equal(h.view().session.error, null);
  assert.equal(h.saved.length, 0);
});

test("cancel refinement preserves previous results and saved history", async () => {
  const h = sessionHarness();
  const result = { query: "Saved product", offers: [{ title: "Existing offer" }] };
  h.view().restore({ id: "history", timestamp: 1, photoUri: null, query: result.query, matches: [], result, error: null, condition: "used" });
  const first = h.view().refine("Different product", "new");
  h.view().cancel();
  assert.equal(h.view().session.result, result);
  const second = h.view().refine("Latest product");
  h.searched[0].resolve({ query: "Different product", offers: [] });
  await first;
  assert.equal(h.view().session.stage, "searching");
  assert.equal(h.saved.length, 0);
  h.searched[1].resolve({ query: "Latest product", offers: [] });
  await second;
  assert.equal(h.view().session.query, "Latest product");
  assert.equal(h.saved.length, 1);
});

test("cancel during native photo preparation does not upload afterward", async () => {
  const prepare = deferred<string>();
  const module = load("lib/shopping-client.ts", {
    "./query-client": { getApiUrl: () => "https://example.com" },
    "./native-camera": { prepareProductPhoto: () => prepare.promise },
    "@/shared/cancellation": { throwIfCanceled },
  });
  const controller = new AbortController();
  const pending = module.identifyPhoto("file:///photo.jpg", "US", controller.signal);
  controller.abort();
  prepare.resolve("base64");
  await assert.rejects(pending, { name: "AbortError" });
});

test("client abort reaches fetch and remains cancellation rather than timeout", async () => {
  const originalFetch = global.fetch;
  const started = deferred<AbortSignal>();
  global.fetch = async (_url, init) => {
    started.resolve(init!.signal!);
    return new Promise((_resolve, reject) => init!.signal!.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError"))));
  };
  try {
    const module = load("lib/shopping-client.ts", {
      "./query-client": { getApiUrl: () => "https://example.com" },
      "./native-camera": {},
      "@/shared/cancellation": { throwIfCanceled },
    });
    const controller = new AbortController();
    const pending = module.searchListings({ query: "Product", country: "US" }, controller.signal);
    const signal = await started.promise;
    controller.abort();
    assert.equal(signal.aborted, true);
    await assert.rejects(pending, { name: "AbortError" });
  } finally { global.fetch = originalFetch; }
});

test("temporary photo cleanup only deletes cache files", () => {
  const deleted: string[] = [];
  const module = load("lib/temporary-photo.ts", {
    "expo-file-system": {
      Paths: { cache: { uri: "file:///app/cache/" } },
      File: class {
        exists = true;
        constructor(private uri: string) {}
        delete() { deleted.push(this.uri); }
      },
    },
  });
  for (const uri of ["data:image/jpeg;base64,saved", "file:///library/photo.jpg", "file:///app/cache/temporary.jpg"]) {
    module.discardTemporaryPhoto(uri);
  }
  assert.deepEqual(deleted, ["file:///app/cache/temporary.jpg"]);
});
