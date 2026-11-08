import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { captureProductPhoto } from "@/lib/native-camera";
import { identifyPhoto } from "@/lib/shopping-client";
import { countryInfo, type PhotoMatch } from "@/shared/shopping";
import { router } from "expo-router";
import ShoppingComparison from "@/components/shopping/ShoppingComparison";
import { useScanTrigger } from "@/lib/scan-trigger";

export default function ScanScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needsSettings, setNeedsSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const opening = useRef(false);
  const country = "US";
  const [matches, setMatches] = useState<PhotoMatch[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const identifying = useRef(false);
  const disabled = busy || comparing;
  const isWeb = Platform.OS === "web";
  const { request } = useScanTrigger();
  const handledRequest = useRef(0);
  const takePhotoRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    if (request > handledRequest.current) {
      handledRequest.current = request;
      void takePhotoRef.current();
    }
  }, [request]);

  function resetIdentification() { setMatches(null); setSelected(null); setError(null); }
  async function identify(uri: string) {
    if (!countryInfo(country) || identifying.current) return;
    identifying.current = true; setBusy(true); setError(null); setMatches(null); setSelected(null);
    try { setMatches((await identifyPhoto(uri, country)).matches); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not identify the photo. Please try again."); }
    finally { identifying.current = false; setBusy(false); }
  }

  async function takePhoto() {
    if (opening.current || identifying.current || comparing || isWeb) return;
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
        resetIdentification();
        setPhotoUri(result.uri);
        await identify(result.uri);
      }
      // Canceling a retake keeps the previous photo.
    } catch {
      setError("The camera could not open or return a photo. Please try again on a phone with a camera.");
    } finally {
      setBusy(false);
      opening.current = false;
    }
  }
  takePhotoRef.current = takePhoto;

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
        <Text style={styles.title}>{identifying.current ? "Identifying Your Product" : photoUri ? "Your Product Photo" : "Take a Product Photo"}</Text>
        {photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="contain" accessibilityLabel="Your captured product photo" />
            <Text style={styles.text}>
              {busy ? "Finding your product… this can take up to a minute." : "Choose the matching product to find where to buy it for less."}
            </Text>
          </>
        ) : (
          <Text style={styles.text}>
            Take a product photo to find where to buy it. Accepted photos are processed by SearchApi and Google Lens.
          </Text>
        )}
        <Pressable accessibilityRole="link" onPress={() => router.push("/photo-privacy")}>
          <Text style={styles.privacyLink}>Photo & Shopping Privacy</Text>
        </Pressable>
        <Text style={styles.text}>Find out what it is and where to buy it for less.</Text>
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
              accessibilityLabel={photoUri ? "Retake product photo" : "Open camera"}
              accessibilityState={{ disabled, busy }}
              disabled={disabled}
              style={[styles.button, disabled && styles.disabled]}
              onPress={takePhoto}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{photoUri ? "Retake Photo" : "Open Camera"}</Text>}
            </Pressable>
          </>
        )}
        {photoUri && (
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            style={[styles.button, disabled && styles.disabled]}
            onPress={() => { setPhotoUri(null); resetIdentification(); setNeedsSettings(false); }}
          >
            <Text style={styles.buttonText}>Clear Photo</Text>
          </Pressable>
        )}
        {photoUri && !isWeb && <>
          {error && !needsSettings && <Pressable accessibilityRole="button" disabled={disabled}
            style={[styles.button, disabled && styles.disabled]} onPress={() => identify(photoUri)}>
            <Text style={styles.buttonText}>Retry Identification</Text>
          </Pressable>}
          {busy && <Text accessibilityRole="alert" style={styles.text}>Working… this can take up to a minute.</Text>}
        </>}
        {matches !== null && <>
          <Text style={styles.title}>{matches.length ? "Possible Matches" : "No Visual Matches"}</Text>
          <Text style={styles.text}>{matches.length ? "Choose a suggestion, then correct its model and variant details. Similar-looking items may be different products." : "Try another photo with the model label visible, or enter the product details manually."}</Text>
          {matches.map((match, index) => <Pressable accessibilityRole="button" key={index} disabled={disabled} style={styles.button} onPress={() => setSelected(match.title)}>
            <Text style={styles.buttonText}>{match.title}</Text><Text style={styles.buttonText}>{match.source}</Text>
          </Pressable>)}
          <Pressable accessibilityRole="button" disabled={disabled} style={styles.button} onPress={() => setSelected("")}><Text style={styles.buttonText}>None of These — Enter Details</Text></Pressable>
        </>}
        {selected !== null && <ShoppingComparison key={`${country}-${selected}`} country={country} initialProduct={selected} onBusyChange={setComparing} />}
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
  privacyLink: { color: Colors.light.accent, fontSize: 13, textAlign: "center", paddingVertical: 8 },
});
