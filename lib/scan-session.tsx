import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { captureProductPhoto } from "./native-camera";
import { identifyPhoto, searchListings } from "./shopping-client";
import type { ListingSearch, PhotoMatch } from "@/shared/shopping";

export type ScanSession = {
  photoUri: string | null;
  stage: "idle" | "camera" | "identifying" | "searching" | "ready" | "error";
  matches: PhotoMatch[];
  query: string;
  result: ListingSearch | null;
  error: string | null;
  needsSettings: boolean;
};
const empty: ScanSession = { photoUri: null, stage: "idle", matches: [], query: "", result: null, error: null, needsSettings: false };
const Context = createContext<{
  session: ScanSession; busy: boolean;
  capture: () => Promise<boolean>;
  refine: (query: string, condition?: "any" | "new" | "used") => Promise<void>;
  retry: () => Promise<void>;
} | null>(null);

export function ScanSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ScanSession>(empty);
  const state = useRef(session);
  state.current = session;
  const lock = useRef(false);
  const lastStage = useRef<"identify" | "search">("identify");
  const conditionRef = useRef<"any" | "new" | "used">("any");
  const patch = (value: Partial<ScanSession>) => setSession(previous => {
    const next = { ...previous, ...value };
    state.current = next;
    return next;
  });

  async function search(query: string, condition: "any" | "new" | "used" = "any") {
    lastStage.current = "search";
    conditionRef.current = condition;
    patch({ query, stage: "searching", error: null, result: null });
    const result = await searchListings({ query, country: "US", condition });
    patch({ result, stage: "ready" });
  }
  async function process(uri: string) {
    lastStage.current = "identify";
    patch({ stage: "identifying", photoUri: uri, matches: [], result: null, query: "", error: null, needsSettings: false });
    try {
      const { matches } = await identifyPhoto(uri, "US");
      patch({ matches });
      const first = matches.find(match => match.title.trim().length >= 3);
      if (first) await search(first.title.trim().slice(0, 180));
      else patch({ stage: "ready" });
    } catch (e) {
      patch({ stage: "error", error: e instanceof Error ? e.message : "Could not search this photo. Please try again." });
    } finally { lock.current = false; }
  }
  async function capture() {
    if (lock.current || Platform.OS === "web") return false;
    lock.current = true;
    const previousStage = state.current.stage;
    patch({ stage: "camera", error: null, needsSettings: false });
    try {
      const result = await captureProductPhoto();
      if (result.status === "captured") {
        // Capture returns immediately after starting the pipeline so the results route can show progress.
        void process(result.uri);
        return true;
      }
      lock.current = false;
      if (result.status === "denied") patch({
        stage: previousStage,
        needsSettings: !result.canAskAgain,
        error: result.canAskAgain ? "Camera access was not granted. Tap Scan to try again." : "Camera access is off. Enable it in your phone’s Settings.",
      });
      else patch({ stage: previousStage });
    } catch {
      lock.current = false;
      patch({ stage: previousStage, error: "The camera could not open. Please try again." });
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
    finally { lock.current = false; }
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
  const busy = ["camera", "identifying", "searching"].includes(session.stage);
  return <Context.Provider value={{ session, busy, capture, refine, retry }}>{children}</Context.Provider>;
}
export function useScanSession() {
  const context = useContext(Context);
  if (!context) throw new Error("Scan session provider is missing.");
  return context;
}
