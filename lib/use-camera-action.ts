import { useRef } from "react";
import { Alert, Linking, Platform } from "react-native";
import { router } from "expo-router";
import { useScanSession } from "./scan-session";

/** A tab action, not a destination: cancellation leaves navigation untouched. */
export function useCameraAction() {
  const { capture, busy } = useScanSession();
  const opening = useRef(false);
  return async () => {
    if (opening.current) return;
    if (Platform.OS === "web") {
      window.alert("Open the iPhone or Android app to use the native camera.");
      return;
    }
    if (busy) {
      router.push("/scan-results");
      return;
    }
    opening.current = true;
    try {
      const accepted = await capture((message, needsSettings) => {
        Alert.alert("Camera access", message, needsSettings ? [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => {
            void Linking.openSettings().catch(() => Alert.alert("Camera settings", "Open your phone’s Settings to allow camera access."));
          } },
        ] : [{ text: "OK" }]);
      });
      if (accepted) router.push("/scan-results");
    } finally { opening.current = false; }
  };
}
