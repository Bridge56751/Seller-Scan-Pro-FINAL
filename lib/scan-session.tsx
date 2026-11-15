import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { captureProductPhoto } from "./native-camera";
import { identifyPhoto, identifyBarcode, searchListings } from "./shopping-client";
import { normalizeBarcode } from "@/shared/barcode";
import type { ListingSearch, PhotoMatch } from "@/shared/shopping";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { randomUUID } from "expo-crypto";
import { photoScanHistory, type PhotoScanHistoryItem } from "./photo-scan-history";
import { photoSearchQueries } from "@/shared/photo-search-query";
import { discardTemporaryPhoto } from "./temporary-photo";

export type ScanSession = {
  source?: "photo" | "barcode";
  barcode?: string | null;
  productImageUrl?: string | null;
  photoUri: string | null;
  stage: "idle" | "camera" | "identifying" | "searching" | "ready" | "error" | "canceled";
  matches: PhotoMatch[];
  query: string;
  result: ListingSearch | null;
  error: string | null;
  needsSettings: boolean;
  historyWarning?: string | null;
};
const empty: ScanSession = { source: "photo", barcode: null, productImageUrl: null, photoUri: null, stage: "idle", matches: [], query: "", result: null, error: null, needsSettings: false };
const Context = createContext<{
  session: ScanSession; busy: boolean; historyVersion: number;
  capture: (onFailure?: (message: string, needsSettings: boolean) => void) => Promise<boolean>;
  startBarcode: (barcode: string) => boolean;
  refine: (query: string, condition?: "any" | "new" | "used") => Promise<void>;
  retry: () => Promise<void>;
  cancel: () => void;
  restore: (item: PhotoScanHistoryItem) => boolean;
} | null>(null);

export function ScanSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ScanSession>(empty);
  const [saving, setSaving] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const state = useRef(session);
  state.current = session;
  const lock = useRef(false);
  const operation = useRef<AbortController | null>(null);
  const previous = useRef<ScanSession>(empty);
  const previousCondition = useRef<"any" | "new" | "used">("any");
  const isCurrent = (op: AbortController) => operation.current === op && !op.signal.aborted;
  useEffect(() => () => { operation.current?.abort(); operation.current = null; }, []);
  function begin() {
    const op = new AbortController();
    operation.current = op;
    previous.current = state.current;
    previousCondition.current = conditionRef.current;
    return op;
  }
  function cancel() {
    if (!["identifying", "searching"].includes(state.current.stage)) return;
    operation.current?.abort();
    operation.current = null;
    lock.current = false;
    setSaving(false);
    conditionRef.current = previousCondition.current;
    // A canceled refinement must not discard the shopper's existing results.
    patch({ ...previous.current, stage: "canceled", error: null });
  }
  const lastStage = useRef<"identify" | "barcode" | "search">("identify");
  const conditionRef = useRef<"any" | "new" | "used">("any");
  const historyRef = useRef<{ id: string; timestamp: number; thumbnail: string | null; saved: boolean } | null>(null);
  const patch = (value: Partial<ScanSession>) => {
    state.current = { ...state.current, ...value };
    setSession(state.current);
  };
  async function saveHistory(op: AbortController) {
    if (!isCurrent(op)) return;
    const info = historyRef.current;
    if (!info) return;
    const current = state.current;
    const condition = conditionRef.current;
    setSaving(true);
    try {
      if (!info.thumbnail && current.photoUri) {
        const image = await manipulateAsync(current.photoUri, [{ resize: { width: 320 } }], { compress: 0.6, format: SaveFormat.JPEG, base64: true });
        try {
          if (!image.base64) throw new Error("Photo thumbnail unavailable");
          info.thumbnail = `data:image/jpeg;base64,${image.base64}`;
        } finally {
          if (image.uri !== current.photoUri) discardTemporaryPhoto(image.uri);
        }
      }
      if (!isCurrent(op)) return;
      await photoScanHistory.save({
        id: info.id, timestamp: info.timestamp, photoUri: info.thumbnail,
        query: current.query, matches: current.matches, result: current.result,
        error: current.error, condition,
        source: current.source, barcode: current.barcode, productImageUrl: current.productImageUrl,
      }, info.saved);
      info.saved = true;
      if (!isCurrent(op)) return;
      setHistoryVersion(value => value + 1);
      patch({ historyWarning: null });
    } catch {
      if (isCurrent(op)) patch({ historyWarning: "This scan could not be saved to History. Your current results are still available." });
    } finally { if (isCurrent(op)) setSaving(false); }
  }
  function restore(item: PhotoScanHistoryItem) {
    if (lock.current) return false;
    historyRef.current = { id: item.id, timestamp: item.timestamp, thumbnail: item.photoUri, saved: true };
    conditionRef.current = item.condition;
    lastStage.current = item.query ? "search" : item.barcode ? "barcode" : "identify";
    patch({ ...empty, photoUri: item.photoUri, query: item.query, matches: item.matches,
      result: item.result, error: item.error, stage: item.error ? "error" : "ready", historyWarning: null,
      source: item.source ?? "photo", barcode: item.barcode ?? null, productImageUrl: item.productImageUrl ?? null });
    return true;
  }

  async function search(op: AbortController, query: string, condition: "any" | "new" | "used" = "any", automatic = false, scanPermit?: string) {
    if (!isCurrent(op)) return;
    lastStage.current = "search";
    conditionRef.current = condition;
    patch({ query, stage: "searching", error: null, result: null });
    const result = await searchListings({ query, country: "US", condition, automatic }, op.signal, scanPermit);
    if (!isCurrent(op)) return;
    patch({ result, query: result.query, stage: "ready" });
  }
  async function process(uri: string, op: AbortController) {
    lastStage.current = "identify";
    patch({ stage: "identifying", photoUri: uri, matches: [], result: null, query: "", error: null, needsSettings: false });
    try {
      const { matches, scanPermit } = await identifyPhoto(uri, "US", op.signal);
      if (!isCurrent(op)) return;
      patch({ matches });
      const first = matches.find(match => match.title.trim().length >= 3);
      if (first) await search(op, photoSearchQueries(first.title)[0], "any", true, scanPermit);
      else patch({ stage: "ready" });
    } catch (e) {
      if (isCurrent(op)) patch({ stage: "error", error: e instanceof Error ? e.message : "Could not search this photo. Please try again." });
    } finally { await finish(op); }
  }
  async function finish(op: AbortController) {
    if (!isCurrent(op)) return;
    await saveHistory(op);
    if (isCurrent(op)) { lock.current = false; operation.current = null; }
  }
  async function processBarcode(barcode: string, op: AbortController) {
    lastStage.current = "barcode";
    patch({ stage: "identifying", error: null });
    try {
      const product = await identifyBarcode(barcode, op.signal);
      if (!isCurrent(op)) return;
      patch({ query: product.query, productImageUrl: product.imageUrl });
      // Preserve the identified variant; don't silently broaden to a different product.
      await search(op, product.query, "any", false, product.scanPermit);
    } catch (error) {
      if (isCurrent(op)) patch({ stage: "error", error: error instanceof Error ? error.message : "Could not look up this barcode." });
    } finally { await finish(op); }
  }
  function startBarcode(raw: string) {
    const barcode = normalizeBarcode(raw);
    if (lock.current || !barcode) return false;
    lock.current = true;
    historyRef.current = { id: randomUUID(), timestamp: Date.now(), thumbnail: null, saved: false };
    conditionRef.current = "any";
    patch({ ...empty, source: "barcode", barcode });
    void processBarcode(barcode, begin());
    return true;
  }
  async function capture(onFailure?: (message: string, needsSettings: boolean) => void) {
    if (lock.current || Platform.OS === "web") return false;
    lock.current = true;
    const previousStage = state.current.stage;
    patch({ stage: "camera", error: null, needsSettings: false });
    try {
      const result = await captureProductPhoto();
      if (result.status === "captured") {
        historyRef.current = { id: randomUUID(), timestamp: Date.now(), thumbnail: null, saved: false };
        conditionRef.current = "any";
        patch({ historyWarning: null });
        // Capture returns immediately after starting the pipeline so the results route can show progress.
        patch({ ...empty, photoUri: result.uri });
        void process(result.uri, begin());
        return true;
      }
      lock.current = false;
      if (result.status === "denied") {
        const message = result.canAskAgain ? "Camera access was not granted. Tap Scan to try again." : "Camera access is off. Enable it in your phone’s Settings.";
        patch({ stage: previousStage, needsSettings: !result.canAskAgain, error: message });
        onFailure?.(message, !result.canAskAgain);
      }
      else patch({ stage: previousStage });
    } catch {
      lock.current = false;
      patch({ stage: previousStage, error: "The camera could not open. Please try again." });
      onFailure?.("The camera could not open. Please try again.", false);
    }
    return false;
  }
  async function refine(query: string, condition: "any" | "new" | "used" = "any") {
    if (lock.current) return;
    const clean = query.trim();
    if (clean.length < 3 || clean.length > 180) {
      patch({ error: "Enter a product name between 3 and 180 characters." });
      return;
    }
    lock.current = true;
    const op = begin();
    try { await search(op, clean, condition); }
    catch (e) { if (isCurrent(op)) patch({ stage: "error", error: e instanceof Error ? e.message : "Could not search listings." }); }
    finally { await finish(op); }
  }
  async function retry() {
    if (lock.current) return;
    if (lastStage.current === "search" && state.current.query) {
      await refine(state.current.query, conditionRef.current);
    } else if (state.current.barcode) {
      lock.current = true;
      await processBarcode(state.current.barcode, begin());
    } else if (state.current.photoUri) {
      lock.current = true;
      await process(state.current.photoUri, begin());
    }
  }
  const busy = saving || ["camera", "identifying", "searching"].includes(session.stage);
  return <Context.Provider value={{ session, busy, historyVersion, capture, startBarcode, refine, retry, cancel, restore }}>{children}</Context.Provider>;
}
export function useScanSession() {
  const context = useContext(Context);
  if (!context) throw new Error("Scan session provider is missing.");
  return context;
}
