import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import { createPhotoConsent } from "@/shared/photo-consent";

const key = "seller-scan:photo-sharing-consent:v1";
export const ensurePhotoConsent = createPhotoConsent({
  read: () => AsyncStorage.getItem(key),
  write: () => AsyncStorage.setItem(key, "accepted"),
  ask: () => {
    if (Platform.OS === "web") return Promise.resolve(false);
    return new Promise<boolean>(resolve => {
      Alert.alert(
        "Before your first photo scan",
        "To identify products and find shopping matches, Seller Scan temporarily stores your scan photos in Supabase and sends them to SearchAPI and Google Lens for processing.\n\nOnly photograph the product—avoid faces, documents, and personal information. Choose Continue to allow this for your photo scans.",
        [
          { text: "Not now", style: "cancel", onPress: () => resolve(false) },
          { text: "Continue", onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) },
      );
    });
  },
});
