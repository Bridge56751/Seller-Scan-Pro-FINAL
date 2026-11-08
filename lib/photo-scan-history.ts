import AsyncStorage from "@react-native-async-storage/async-storage";
import { createPhotoHistoryStore } from "./photo-scan-history-store";
export type { PhotoScanHistoryItem } from "./photo-scan-history-store";
export const photoScanHistory = createPhotoHistoryStore(AsyncStorage);
