import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Platform } from "react-native";
import * as StoreReview from "expo-store-review";
import { createScanReviewTracker } from "@/shared/barcode-review";

// Keep the existing key so barcode progress and prior prompt requests survive.
const key = "seller-scan:barcode-review:v1";
const track = createScanReviewTracker({
  read: () => AsyncStorage.getItem(key),
  write: value => AsyncStorage.setItem(key, value),
  available: async () => AppState.currentState === "active" && await StoreReview.isAvailableAsync(),
  request: () => StoreReview.requestReview(),
});

export async function recordSuccessfulScan(scanId: string) {
  if (Platform.OS !== "ios") return;
  try { await track(scanId); }
  catch (error) {
    // A review/storage failure must never turn a successful scan into an error.
    console.warn("Scan review request could not complete", error);
  }
}
