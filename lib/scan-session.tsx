import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { captureProductPhoto } from "./native-camera";
import { identifyPhoto, searchListings } from "./shopping-client";
import type { ListingSearch, PhotoMatch } from "@/shared/shopping";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { randomUUID } from "expo-crypto";
import { photoScanHistory, type PhotoScanHistoryItem } from "./photo-scan-history";
import { photoSearchQueries } from "@/shared/photo-search-query";

export type ScanSession = {
  photoUri: string | null;
  stage: "idle" | "camera" | "identifying" | "searching" | "ready" | "error";
  matches: PhotoMatch[];
  query: string;
  result: ListingSearch | null;
  error: string | null;
  needsSettings: boolean;
  historyWarning?: string | null;
};
const empty: ScanSession = { photoUri: null, stage: "idle", matches: [], query: "", result: null, error: null, needsSettings: false };
const Context = createContext<{
  session: ScanSession; busy: boolean; historyVersion: number;
  capture: (onFailure?: (message: string, needsSettings: boolean) => void) => Promise<boolean>;
  refine: (query: string, condition?: "any" | "new" | "used") => Promise<void>;
  retry: () => Promise<void>;
  restore: (item: PhotoScanHistoryItem) => boolean;
} | null>(null);

export function ScanSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ScanSession>(empty);
  const [saving, setSaving] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const state = useRef(session);
  state.current = session;
  const lock = useRef(false);
  const lastStage = useRef<"identify" | "search">("identify");
  const conditionRef = useRef<"any" | "new" | "used">("any");
  const historyRef = useRef<{ id: string; timestamp: number; thumbnail: string | null; saved: boolean } | null>(null);
  const patch = (value: Partial<ScanSession>) => {
    state.current = { ...state.current, ...value };
    setSession(state.current);
  };
  async function saveHistory() {
    const info = historyRef.current;
    if (!info) return;
    setSaving(true);
    try {
      if (!info.thumbnail && state.current.photoUri) {
        const image = await manipulateAsync(state.current.photoUri, [{ resize: { width: 320 } }], { compress: 0.6, format: SaveFormat.JPEG, base64: true });
        if (!image.base64) throw new Error("Photo thumbnail unavailable");
        info.thumbnail = `data:image/jpeg;base64,${image.base64}`;
      }
      const current = state.current;
      await photoScanHistory.save({
        id: info.id, timestamp: info.timestamp, photoUri: info.thumbnail,
        query: current.query, matches: current.matches, result: current.result,
        error: current.error, condition: conditionRef.current,
      }, info.saved);
      info.saved = true;
      setHistoryVersion(value => value + 1);
      patch({ historyWarning: null });
    } catch {
      patch({ historyWarning: "This scan could not be saved to History. Your current results are still available." });
    } finally { setSaving(false); }
  }
  function restore(item: PhotoScanHistoryItem) {
    if (lock.current) return false;
    historyRef.current = { id: item.id, timestamp: item.timestamp, thumbnail: item.photoUri, saved: true };
    conditionRef.current = item.condition;
    lastStage.current = item.query ? "search" : "identify";
    patch({ ...empty, photoUri: item.photoUri, query: item.query, matches: item.matches,
      result: item.result, error: item.error, stage: item.error ? "error" : "ready", historyWarning: null });
    return true;
  }

  async function search(query: string, condition: "any" | "new" | "used" = "any", automatic = false) {
    lastStage.current = "search";
    conditionRef.current = condition;
    patch({ query, stage: "searching", error: null, result: null });
    const result = await searchListings({ query, country: "US", condition, automatic });
    patch({ result, query: result.query, stage: "ready" });
  }
  async function process(uri: string) {
    lastStage.current = "identify";
    patch({ stage: "identifying", photoUri: uri, matches: [], result: null, query: "", error: null, needsSettings: false });
    try {
      const { matches } = await identifyPhoto(uri, "US");
      patch({ matches });
      const first = matches.find(match => match.title.trim().length >= 3);
      if (first) await search(photoSearchQueries(first.title)[0], "any", true);
      else patch({ stage: "ready" });
    } catch (e) {
      patch({ stage: "error", error: e instanceof Error ? e.message : "Could not search this photo. Please try again." });
    } finally { await saveHistory(); lock.current = false; }
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
        void process(result.uri);
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
    try { await search(clean, condition); }
    catch (e) { patch({ stage: "error", error: e instanceof Error ? e.message : "Could not search listings." }); }
    finally { await saveHistory(); lock.current = false; }
  }
  async function retry() {
    if (lock.current) return;
    if (lastStage.current === "search" && state.current.query) {
      await refine(state.current.query, conditionRef.current);
    } else if (state.current.photoUri) {
      lock.current = true;
      await process(state.current.photoUri);
    }
  }
  const busy = saving || ["camera", "identifying", "searching"].includes(session.stage);
  return <Context.Provider value={{ session, busy, historyVersion, capture, refine, retry, restore }}>{children}</Context.Provider>;
}
export function useScanSession() {
  const context = useContext(Context);
  if (!context) throw new Error("Scan session provider is missing.");
  return context;
}
