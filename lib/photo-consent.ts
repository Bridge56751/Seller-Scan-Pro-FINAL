import AsyncStorage from "@react-native-async-storage/async-storage";
import { PHOTO_CONSENT_VERSION } from "@/shared/shopping";

const KEY = "automatic-photo-identification-consent";
export async function hasPhotoConsent() {
  return await AsyncStorage.getItem(KEY) === PHOTO_CONSENT_VERSION;
}
export async function grantPhotoConsent() {
  await AsyncStorage.setItem(KEY, PHOTO_CONSENT_VERSION);
}
export async function revokePhotoConsent() {
  await AsyncStorage.removeItem(KEY);
}
