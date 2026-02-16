import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ScanHistoryItem } from "./mock-data";

const HISTORY_KEY = "scan_history";
const MAX_HISTORY = 100;

export async function getScanHistory(): Promise<ScanHistoryItem[]> {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data) as ScanHistoryItem[];
  } catch {
    return [];
  }
}

export async function addToScanHistory(item: ScanHistoryItem): Promise<void> {
  try {
    const history = await getScanHistory();
    const filtered = history.filter((h) => h.asin !== item.asin);
    const updated = [item, ...filtered].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    console.error("Failed to save scan history");
  }
}

export async function clearScanHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {
    console.error("Failed to clear scan history");
  }
}

export async function removeScanHistoryItem(asin: string): Promise<void> {
  try {
    const history = await getScanHistory();
    const updated = history.filter((h) => h.asin !== asin);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    console.error("Failed to remove scan history item");
  }
}
