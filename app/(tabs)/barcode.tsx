import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/constants/colors";
import { useScanSession } from "@/lib/scan-session";
import { normalizeBarcode } from "@/shared/barcode";

const supportedTypes = ["ean13", "ean8", "upc_a", "itf14"] as const;

export default function BarcodeScreen() {
  const { busy, startBarcode } = useScanSession();
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(AppState.currentState === "active");
  const [cameraError, setCameraError] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const detectionLock = useRef(false);
  const requested = useRef(false);
  const permissionLock = useRef(false);
  const permissionRefresh = useRef(getPermission);
  permissionRefresh.current = getPermission;
  const isWeb = Platform.OS === "web";

  useFocusEffect(useCallback(() => {
    detectionLock.current = false;
    setFocused(true);
    setMessage(null);
    setReady(false);
    if (!isWeb) void permissionRefresh.current().catch(() => setMessage("Camera permission could not be checked. Please try again."));
    return () => { setFocused(false); detectionLock.current = true; };
  }, [isWeb]));

  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      setActive(state === "active");
      if (state === "active" && !isWeb) {
        void permissionRefresh.current().catch(() => setMessage("Camera permission could not be checked. Please try again."));
      }
      if (state !== "active") setReady(false);
    });
    return () => subscription.remove();
  }, [isWeb]);

  const askPermission = useCallback(async () => {
    if (permissionLock.current) return;
    permissionLock.current = true;
    setMessage(null);
    try { await requestPermission(); }
    catch { setMessage("Camera access could not be requested. Try again or enable it in Settings."); }
    finally { permissionLock.current = false; }
  }, [requestPermission]);

  useEffect(() => {
    if (isWeb || !focused || !active || busy || !permission || requested.current) return;
    requested.current = true;
    if (!permission.granted && permission.canAskAgain) void askPermission();
  }, [isWeb, focused, active, busy, permission, askPermission]);

  const cameraMounted = !isWeb && focused && active && !!permission?.granted && !busy && !cameraError;

  function detect(result: BarcodeScanningResult) {
    if (!cameraMounted || detectionLock.current) return;
    if (!(supportedTypes as readonly string[]).includes(result.type)) {
      setMessage("This barcode format is not supported. Scan an EAN-13, EAN-8, UPC-A or ITF-14 product barcode instead.");
      return;
    }
    const code = normalizeBarcode(result.data);
    if (!code) {
      setMessage("This barcode could not be validated. Hold the full product barcode steady, move away from glare and try again. QR codes and UPC-E are not supported.");
      return;
    }
    detectionLock.current = true;
    setMessage(null);
    if (startBarcode(code)) router.push("/scan-results");
    else {
      detectionLock.current = false;
      setMessage("A new lookup could not start. Wait for the current scan to finish, then try again.");
    }
  }

  async function openSettings() {
    try { await Linking.openSettings(); }
    catch { setMessage("Open your phone’s Settings and allow camera access for Seller Scan."); }
  }

  function retryCamera() {
    setCameraError(false);
    setReady(false);
    setMessage(null);
    detectionLock.current = false;
    setCameraKey(value => value + 1);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.title}>Barcode</Text>
          <Text style={styles.body}>Scan a product barcode to identify it and compare store listings.</Text>
        </View>
        {isWeb ? <View style={styles.state}>
          <Feather name="smartphone" size={34} color={Colors.light.accent} />
          <Text style={styles.stateTitle}>Scan in the mobile app</Text>
          <Text style={styles.centered}>Live barcode scanning is available in the iPhone and Android app. Your browser preview does not use the camera.</Text>
        </View> : busy ? <View style={styles.state}>
          <Feather name="search" size={34} color={Colors.light.accent} />
          <Text style={styles.stateTitle}>A scan is already in progress</Text>
          <Text style={styles.centered}>The camera is paused while we work on your current scan.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push("/scan-results")} style={styles.button}>
            <Text style={styles.buttonText}>Return to Current Results</Text>
          </Pressable>
        </View> : !permission ? <View accessibilityRole="progressbar" accessibilityLabel="Checking camera permission" style={styles.state}>
          <View style={styles.skeleton} />
          <Text style={styles.centered}>Checking camera access…</Text>
          <Pressable accessibilityRole="button" onPress={askPermission} style={styles.secondaryButton}><Text style={styles.link}>Retry Camera Access</Text></Pressable>
        </View> : !permission.granted ? <View style={styles.state}>
          <Feather name="camera-off" size={34} color={Colors.light.accent} />
          <Text style={styles.stateTitle}>Allow camera access</Text>
          <Text style={styles.centered}>Barcode scanning uses your back camera. {permission.canAskAgain ? "Allow access to start scanning." : "Enable camera access in your phone’s Settings, then return here."}</Text>
          <Pressable accessibilityRole="button" onPress={permission.canAskAgain ? askPermission : openSettings} style={styles.button}>
            <Text style={styles.buttonText}>{permission.canAskAgain ? "Allow Camera / Try Again" : "Open Settings"}</Text>
          </Pressable>
        </View> : cameraError ? <View style={styles.state}>
          <Feather name="alert-circle" size={34} color={Colors.light.danger} />
          <Text accessibilityRole="alert" style={styles.stateTitle}>The camera could not start</Text>
          <Text style={styles.centered}>Close any other app using the camera, then try again.</Text>
          <Pressable accessibilityRole="button" onPress={retryCamera} style={styles.button}><Text style={styles.buttonText}>Retry Camera</Text></Pressable>
        </View> : <View style={styles.cameraFrame}>
          {cameraMounted && <CameraView
            key={cameraKey}
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: [...supportedTypes] }}
            onBarcodeScanned={detect}
            onCameraReady={() => setReady(true)}
            onMountError={() => { setCameraError(true); setReady(false); }}
            accessibilityLabel="Live back camera for product barcode scanning"
          />}
          <View pointerEvents="none" style={styles.cameraOverlay}>
            <View style={styles.viewfinder} />
            <Text style={styles.cameraHint}>{ready && cameraMounted ? "Keep the entire barcode inside the frame" : "Preparing camera…"}</Text>
          </View>
        </View>}
        {message && <View style={styles.feedback}><Feather name="info" size={18} color={Colors.light.accent} /><Text accessibilityLiveRegion="polite" style={styles.feedbackText}>{message}</Text></View>}
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Line up the bars, not the product</Text>
          <Text style={styles.body}>Use even lighting and keep the numbers and bars in view. Scanning starts automatically when a valid code is detected.</Text>
          <Text style={styles.caption}>Supports EAN-13, EAN-8, UPC-A and ITF-14. QR codes and UPC-E are not supported. Check the product and offer details at the store; listings are possible matches.</Text>
          <Text style={styles.caption}>Product lookup by UPCitemdb. Free lookup capacity is shared across the app; store searches use our existing shopping service.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flexGrow: 1, padding: 20, paddingBottom: 28, gap: 18, width: "100%", maxWidth: 680, alignSelf: "center" },
  heading: { gap: 8 },
  title: { fontSize: 26, fontWeight: "700", letterSpacing: -0.5, color: Colors.light.text },
  body: { fontSize: 14, lineHeight: 21, color: Colors.light.textSecondary },
  state: { minHeight: 300, borderRadius: 16, padding: 24, gap: 16, backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border, alignItems: "center", justifyContent: "center" },
  stateTitle: { fontSize: 19, fontWeight: "700", color: Colors.light.text, textAlign: "center" },
  centered: { fontSize: 14, lineHeight: 21, color: Colors.light.textSecondary, textAlign: "center" },
  button: { minHeight: 48, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: Colors.light.accent, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 14, fontWeight: "600", color: Colors.light.surface, textAlign: "center" },
  secondaryButton: { minHeight: 44, padding: 12, justifyContent: "center" },
  link: { color: Colors.light.accent, fontWeight: "600", fontSize: 14 },
  cameraFrame: { width: "100%", aspectRatio: 1, maxHeight: 430, borderRadius: 18, overflow: "hidden", backgroundColor: Colors.light.text },
  cameraOverlay: { flex: 1, justifyContent: "center", alignItems: "center", gap: 24, padding: 20 },
  viewfinder: { width: "94%", height: "43%", borderRadius: 16, borderWidth: 3, borderColor: Colors.light.surface },
  cameraHint: { color: Colors.light.surface, backgroundColor: "rgba(26,29,38,0.8)", padding: 12, borderRadius: 8, fontSize: 12, lineHeight: 18, textAlign: "center" },
  tips: { gap: 9, paddingHorizontal: 2 },
  tipsTitle: { color: Colors.light.text, fontSize: 16, fontWeight: "600" },
  caption: { fontSize: 12, lineHeight: 19, color: Colors.light.textTertiary },
  feedback: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, backgroundColor: Colors.light.accentDim },
  feedbackText: { flex: 1, fontSize: 13, lineHeight: 20, color: Colors.light.textSecondary },
  skeleton: { width: "100%", height: 120, backgroundColor: Colors.light.borderLight, borderRadius: 12 },
});
