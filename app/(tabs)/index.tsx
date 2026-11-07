import { useRef, useState } from "react";
import { ActivityIndicator, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { captureProductPhoto } from "@/lib/native-camera";

export default function ScanScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsSettings, setNeedsSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const opening = useRef(false);
  const isWeb = Platform.OS === "web";

  async function takePhoto() {
    if (opening.current || isWeb) return;
    opening.current = true;
    setBusy(true);
    setError(null);
    setNeedsSettings(false);
    try {
      const result = await captureProductPhoto();
      if (result.status === "denied") {
        setNeedsSettings(!result.canAskAgain);
        setError(result.canAskAgain
          ? "Camera access was not granted. You can continue using the other tabs or try again."
          : "Camera access is off. You can allow it in your phone’s Settings, then return and try again.");
      } else if (result.status === "captured") {
        setPhotoUri(result.uri);
      }
      // Canceling a retake keeps the previous photo.
    } catch {
      setError("The camera could not open or return a photo. Please try again on a phone with a camera.");
    } finally {
      setBusy(false);
      opening.current = false;
    }
  }

  async function openSettings() {
    try {
      await Linking.openSettings();
    } catch {
      setError("Could not open Settings. Open your phone’s Settings manually to manage camera access.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{photoUri ? "Your Product Photo" : "Take a Product Photo"}</Text>
        {photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="contain" accessibilityLabel="Your captured product photo" />
            <Text style={styles.text}>
              Your photo is ready to review. Product identification and price comparisons are not connected yet.
            </Text>
          </>
        ) : (
          <Text style={styles.text}>
            Use your phone’s native camera to photograph a product. Keep the item and its model name clearly visible.
          </Text>
        )}
        <Text style={styles.text}>
          Photos stay on this device for now and are not uploaded. This app does not save them to your photo library.
        </Text>
        {isWeb ? (
          <Text style={styles.text}>
            The native camera is available in the iPhone and Android app, not this browser preview.
          </Text>
        ) : (
          <>
            {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            {needsSettings && (
              <Pressable accessibilityRole="button" style={styles.button} onPress={openSettings}>
                <Text style={styles.buttonText}>Open Settings</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={photoUri ? "Retake product photo" : "Continue to camera"}
              accessibilityState={{ disabled: busy, busy }}
              disabled={busy}
              style={[styles.button, busy && styles.disabled]}
              onPress={takePhoto}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{photoUri ? "Retake Photo" : "Continue"}</Text>}
            </Pressable>
          </>
        )}
        {photoUri && (
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            style={[styles.button, busy && styles.disabled]}
            onPress={() => { setPhotoUri(null); setError(null); setNeedsSettings(false); }}
          >
            <Text style={styles.buttonText}>Clear Photo</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flexGrow: 1, justifyContent: "center", padding: 28, gap: 20 },
  title: { fontSize: 24, fontWeight: "700", color: Colors.light.text, textAlign: "center" },
  text: { fontSize: 16, lineHeight: 24, color: Colors.light.textSecondary, textAlign: "center" },
  button: { backgroundColor: Colors.light.accent, padding: 16, borderRadius: 8, alignItems: "center", minHeight: 52 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.6 },
  photo: { width: "100%", height: 260, backgroundColor: Colors.light.surface, borderRadius: 8 },
  error: { color: Colors.light.danger, fontSize: 14, lineHeight: 20, textAlign: "center" },
});
