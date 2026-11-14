import type { ListingSearch, PhotoMatch } from "../shared/shopping";

export type PhotoScanHistoryItem = {
  source?: "photo" | "barcode"; barcode?: string | null; productImageUrl?: string | null;
  id: string; timestamp: number; photoUri: string | null; query: string;
  matches: PhotoMatch[]; result: ListingSearch | null;
  error: string | null; condition: "any" | "new" | "used";
};
type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> };
export const PHOTO_HISTORY_KEY = "photo_scan_history_v1";
export function createPhotoHistoryStore(storage: Storage) {
  let queue: Promise<unknown> = Promise.resolve();
  const serialize = <T,>(operation: () => Promise<T>): Promise<T> => {
    const work = queue.then(operation);
    queue = work.catch(() => {});
    return work;
  };
  async function read() {
    const raw = await storage.getItem(PHOTO_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some(item => typeof item?.id !== "string" || typeof item?.timestamp !== "number"))
      throw new Error("Saved scan history could not be read.");
    return (parsed as PhotoScanHistoryItem[]).sort((a, b) => b.timestamp - a.timestamp);
  }
  return {
    list: () => serialize(read),
    save: (item: PhotoScanHistoryItem, updateOnly = false) => serialize(async () => {
      const items = await read();
      if (updateOnly && !items.some(row => row.id === item.id)) return;
      const next = [item, ...items.filter(row => row.id !== item.id)].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
      await storage.setItem(PHOTO_HISTORY_KEY, JSON.stringify(next));
    }),
    remove: (id: string) => serialize(async () => {
      await storage.setItem(PHOTO_HISTORY_KEY, JSON.stringify((await read()).filter(item => item.id !== id)));
    }),
    clear: () => serialize(() => storage.setItem(PHOTO_HISTORY_KEY, "[]")),
  };
}
