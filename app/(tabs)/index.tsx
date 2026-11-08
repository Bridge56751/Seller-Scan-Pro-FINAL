import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useScanTrigger } from "@/lib/scan-trigger";
import { useScanSession } from "@/lib/scan-session";

export default function ScanScreen() {
  const { session, busy, capture } = useScanSession();
  const { request } = useScanTrigger();
  const handledRequest = useRef(0);
  const opening = useRef(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const takePhotoRef = useRef<() => Promise<void>>(async () => {});
  const isWeb = Platform.OS === "web";

  async function takePhoto() {
    if (opening.current || busy || isWeb) return;
    opening.current = true;
    setLocalError(null);
    try {
      if (await capture()) router.push("/scan-results");
    } catch {
      setLocalError("The camera could not open. Please try again.");
    } finally {
      opening.current = false;
    }
  }
  takePhotoRef.current = takePhoto;

  useEffect(() => {
    if (request > handledRequest.current) {
      handledRequest.current = request;
      void takePhotoRef.current();
    }
  }, [request]);

  async function openSettings() {
    try { await Linking.openSettings(); }
    catch { setLocalError("Open your phone’s Settings to allow camera access."); }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topline}>
          <Text style={styles.eyebrow}>PHOTO PRICE SEARCH</Text>
          <Feather name="shopping-bag" size={20} color={Colors.light.accent} />
        </View>
        <View style={styles.hero}>
          <View style={styles.cameraFrame}>
            <Feather name="camera" size={52} color={Colors.light.accent} />
            <View style={styles.frameCorner} />
          </View>
          <Text style={styles.title}>See it. Scan it.{"\n"}Find it for less.</Text>
          <Text style={styles.description}>Photograph a product to find possible matches and compare prices across stores.</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.step}>
            <View style={styles.stepIcon}><Feather name="camera" size={18} color={Colors.light.accent} /></View>
            <View style={styles.stepCopy}><Text style={styles.stepTitle}>Point at the product</Text><Text style={styles.stepText}>A clear photo with the label visible works best.</Text></View>
          </View>
          <View style={styles.divider} />
          <View style={styles.step}>
            <View style={styles.stepIcon}><Feather name="tag" size={18} color={Colors.light.accent} /></View>
            <View style={styles.stepCopy}><Text style={styles.stepTitle}>Go straight to prices</Text><Text style={styles.stepText}>Browse listings. Refine only if you need to.</Text></View>
          </View>
        </View>
        {(localError || session.error) && <Text accessibilityRole="alert" style={styles.error}>{localError || session.error}</Text>}
        {session.needsSettings && <Pressable accessibilityRole="button" onPress={openSettings} style={styles.secondary}><Text style={styles.secondaryText}>Open Camera Settings</Text></Pressable>}
        {isWeb ? <View style={styles.webNote}><Feather name="smartphone" size={20} color={Colors.light.accent} /><Text style={styles.note}>Open the iPhone or Android app to scan with your native camera. Camera scanning is not available in the browser.</Text></View> : (
          <Pressable accessibilityRole="button" accessibilityLabel="Scan a product with your camera" accessibilityState={{ disabled: busy, busy }} disabled={busy} onPress={takePhoto} style={({ pressed }) => [styles.primary, (busy || pressed) && styles.dimmed]}>
            {busy ? <ActivityIndicator color={Colors.light.surface} /> : <Feather name="camera" size={21} color={Colors.light.surface} />}
            <Text style={styles.primaryText}>{busy ? "Scan in progress…" : "Scan a Product"}</Text>
          </Pressable>
        )}
        {session.photoUri && <Pressable accessibilityRole="button" onPress={() => router.push("/scan-results")} style={styles.secondary}><Text style={styles.secondaryText}>{busy ? "View scan progress" : "Back to your results"}</Text><Feather name="arrow-right" size={17} color={Colors.light.accent} /></Pressable>}
        <Text style={styles.disclosure}>Accepted photos are processed by SearchApi and Google Lens. Results are suggestions, not exact identification.</Text>
        <Pressable accessibilityRole="link" onPress={() => router.push("/photo-privacy")} style={styles.privacy}><Text style={styles.privacyText}>Photo & Shopping Privacy</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32, gap: 18 },
  topline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 1.8, color: Colors.light.textSecondary },
  hero: { alignItems: "center", paddingTop: 24, paddingBottom: 8, gap: 18 },
  cameraFrame: { width: 116, height: 116, alignItems: "center", justifyContent: "center", backgroundColor: Colors.light.accentDim, borderRadius: 30, borderWidth: 1, borderColor: Colors.light.border },
  frameCorner: { position: "absolute", right: 14, top: 14, width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.light.accent },
  title: { fontSize: 32, lineHeight: 39, letterSpacing: -1, fontWeight: "700", color: Colors.light.text, textAlign: "center" },
  description: { fontSize: 16, lineHeight: 24, color: Colors.light.textSecondary, textAlign: "center", maxWidth: 340 },
  card: { padding: 18, backgroundColor: Colors.light.surface, borderRadius: 18, borderWidth: 1, borderColor: Colors.light.border, gap: 16 },
  step: { flexDirection: "row", gap: 12, alignItems: "center" },
  stepIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.light.accentDim, alignItems: "center", justifyContent: "center" },
  stepCopy: { flex: 1, gap: 4 },
  stepTitle: { fontSize: 14, fontWeight: "600", color: Colors.light.text },
  stepText: { fontSize: 12, lineHeight: 18, color: Colors.light.textSecondary },
  divider: { height: 1, backgroundColor: Colors.light.borderLight, marginLeft: 50 },
  primary: { minHeight: 56, borderRadius: 14, backgroundColor: Colors.light.accent, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16 },
  primaryText: { fontSize: 16, fontWeight: "600", color: Colors.light.surface },
  secondary: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  secondaryText: { fontSize: 14, fontWeight: "600", color: Colors.light.accent },
  dimmed: { opacity: 0.6 },
  disclosure: { fontSize: 11, lineHeight: 17, color: Colors.light.textSecondary, textAlign: "center" },
  privacy: { alignSelf: "center", padding: 8 },
  privacyText: { fontSize: 12, color: Colors.light.accent },
  error: { color: Colors.light.danger, fontSize: 14, lineHeight: 21 },
  webNote: { backgroundColor: Colors.light.accentDim, padding: 16, borderRadius: 14, flexDirection: "row", gap: 12 },
  note: { flex: 1, fontSize: 13, lineHeight: 20, color: Colors.light.textSecondary },
});
