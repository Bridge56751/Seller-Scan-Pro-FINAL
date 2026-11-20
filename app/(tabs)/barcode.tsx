import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import Colors from "@/constants/colors";
import { useScanSession } from "@/lib/scan-session";
import { normalizeBarcode } from "@/shared/barcode";
import { createCameraActivationGate } from "@/shared/camera-activation";
import ScanBrandHeader from "@/components/ScanBrandHeader";

const supportedTypes = ["ean13", "ean8", "upc_a", "itf14"] as const;
const scannerSettings = { barcodeTypes: [...supportedTypes] };

export default function BarcodeScreen() {
  const { busy, startBarcode } = useScanSession();
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(AppState.currentState === "active");
  const [cameraError, setCameraError] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);
  const [refocusing, setRefocusing] = useState(false);
  const [torch, setTorch] = useState(false);
  const focusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const gateRef = useRef<ReturnType<typeof createCameraActivationGate> | null>(null);
  if (!gateRef.current) gateRef.current = createCameraActivationGate(setCameraActive);
  const gate = gateRef.current;
  const focusRef = useRef(false);
  const foregroundRef = useRef(AppState.currentState === "active");
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const detectionLock = useRef(false);
  const requested = useRef(false);
  const permissionLock = useRef(false);
  const permissionRefresh = useRef(getPermission);
  permissionRefresh.current = getPermission;
  const isWeb = Platform.OS === "web";

  useFocusEffect(useCallback(() => {
    focusRef.current = true;
    detectionLock.current = false;
    setFocused(true);
    setMessage(null);
    if (!isWeb) void permissionRefresh.current().catch(() => {
      if (focusRef.current) setMessage("Camera permission could not be checked. Please try again.");
    });
    return () => {
      focusRef.current = false;
      if (focusTimer.current) clearTimeout(focusTimer.current);
      focusTimer.current = null;
      setRefocusing(false);
      setTorch(false);
      gate.stop();
      setFocused(false);
      detectionLock.current = true;
    };
  }, [isWeb, gate]));

  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      foregroundRef.current = state === "active";
      if (state !== "active") gate.stop();
      setActive(state === "active");
      if (state === "active" && !isWeb && focusRef.current) {
        void permissionRefresh.current().catch(() => {
          if (focusRef.current) setMessage("Camera permission could not be checked. Please try again.");
        });
      }
    });
    return () => { subscription.remove(); gate.stop(); };
  }, [isWeb, gate]);

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

  const wantsCamera = !isWeb && focused && active && !!permission?.granted && !busy && !cameraError;
  useEffect(() => {
    if (wantsCamera) gate.start();
    else gate.stop();
    return () => gate.stop();
  }, [wantsCamera, cameraKey, gate]);
  // iOS supports pausing the native session without repeatedly destroying its
  // capture graph on every tab change. Other platforms keep conditional mounting.
  const cameraMounted = !isWeb && !!permission?.granted && !cameraError &&
    (Platform.OS === "ios" || (wantsCamera && cameraActive));
  const canDetect = () => gate.isActive() && focusRef.current && foregroundRef.current && !busyRef.current;

  function refocus() {
    if (!canDetect() || refocusing) return;
    setRefocusing(true);
    // Expo iOS "on" is one-shot focus; always return to continuous ("off").
    focusTimer.current = setTimeout(() => {
      focusTimer.current = null;
      setRefocusing(false);
    }, 1200);
  }

  function detect(result: BarcodeScanningResult) {
    if (!canDetect() || detectionLock.current) return;
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
    gate.stop();
    setMessage(null);
    if (startBarcode(code)) router.push("/scan-results");
    else {
      detectionLock.current = false;
      if (focusRef.current && foregroundRef.current && !busyRef.current) gate.start();
      setMessage("A new lookup could not start. Wait for the current scan to finish, then try again.");
    }
  }

  async function openSettings() {
    try { await Linking.openSettings(); }
    catch { setMessage("Open your phone’s Settings and allow camera access for Seller Scan."); }
  }

  function retryCamera() {
    gate.stop();
    setCameraError(false);
    setReady(false);
    setMessage(null);
    detectionLock.current = false;
    setCameraKey(value => value + 1);
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <ScanBrandHeader />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.title}>Scan a barcode</Text>
          <Text style={styles.body}>Find the item. Compare places to buy.</Text>
        </View>
        {isWeb ? <View style={styles.state}>
          <Feather name="smartphone" size={34} color={Colors.light.accent} />
          <Text style={styles.stateTitle}>Scan in the mobile app</Text>
          <Text style={styles.centered}>Open the iPhone app to scan a product barcode.</Text>
        </View> : null}
        {!isWeb && busy && <View style={styles.state}>
          <Feather name="search" size={34} color={Colors.light.accent} />
          <Text style={styles.stateTitle}>Scan in progress</Text>
          <Text style={styles.centered}>The camera is paused for your current search.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push("/scan-results")} style={styles.button}>
            <Text style={styles.buttonText}>View current scan</Text>
          </Pressable>
        </View>}
        {isWeb ? null : !permission ? <View accessibilityRole="progressbar" accessibilityLabel="Checking camera permission" style={styles.state}>
          <View style={styles.skeleton} />
          <Text style={styles.centered}>Checking camera access…</Text>
          <Pressable accessibilityRole="button" onPress={askPermission} style={styles.secondaryButton}><Text style={styles.link}>Retry Camera Access</Text></Pressable>
        </View> : !permission.granted ? <View style={styles.state}>
          <Feather name="camera-off" size={34} color={Colors.light.accent} />
          <Text style={styles.stateTitle}>Allow camera access</Text>
          <Text style={styles.centered}>{permission.canAskAgain ? "Use your camera to scan product barcodes." : "Enable camera access in Settings, then return here."}</Text>
          <Pressable accessibilityRole="button" onPress={permission.canAskAgain ? askPermission : openSettings} style={styles.button}>
            <Text style={styles.buttonText}>{permission.canAskAgain ? "Allow camera" : "Open Settings"}</Text>
          </Pressable>
        </View> : cameraError ? <View style={styles.state}>
          <Feather name="alert-circle" size={34} color={Colors.light.danger} />
          <Text accessibilityRole="alert" style={styles.stateTitle}>The camera could not start</Text>
          <Text style={styles.centered}>Close any other app using the camera, then try again.</Text>
          <Pressable accessibilityRole="button" onPress={retryCamera} style={styles.button}><Text style={styles.buttonText}>Retry Camera</Text></Pressable>
        </View> : <View style={[styles.cameraFrame, busy && styles.hiddenCamera]}>
          {cameraMounted && <CameraView
            key={cameraKey}
            style={StyleSheet.absoluteFill}
            facing="back"
            responsiveOrientationWhenOrientationLocked={false}
            autofocus={refocusing && wantsCamera ? "on" : "off"}
            enableTorch={torch && wantsCamera && cameraActive}
            active={wantsCamera && cameraActive}
            barcodeScannerSettings={scannerSettings}
            onBarcodeScanned={detect}
            onCameraReady={() => setReady(true)}
            onMountError={() => {
              if (!focusRef.current || !foregroundRef.current || busyRef.current) return;
              gate.stop();
              setCameraError(true); setReady(false);
            }}
            accessibilityLabel="Live back camera for product barcode scanning"
          />}
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityRole="button"
            accessibilityLabel="Refocus barcode camera"
            accessibilityHint="Tap to refocus at the center. Move the barcode farther away if it stays blurry."
            disabled={!cameraActive || refocusing}
            onPress={refocus}
          />
          <View pointerEvents="none" style={styles.cameraOverlay}>
            <View style={styles.shade} />
            <View style={styles.finderRow}>
              <View style={styles.shade} />
              <View style={styles.viewfinder}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <View style={styles.shade} />
            </View>
            <View style={[styles.shade, styles.hintArea]}>
              <Text accessibilityLiveRegion="polite" style={styles.cameraHint}>{ready && cameraActive ? refocusing ? "Focusing…" : "Blurry? Move back a little. Tap to refocus." : "Preparing camera…"}</Text>
            </View>
          </View>
          {cameraActive && <Pressable
            accessibilityRole="button"
            accessibilityLabel={torch ? "Turn camera light off" : "Turn camera light on"}
            accessibilityState={{ selected: torch }}
            onPress={() => setTorch(value => !value)}
            style={styles.torchButton}
          >
            <Feather name={torch ? "zap" : "zap-off"} size={21} color="#FFFFFF" />
          </Pressable>}
        </View>}
        {message && <View style={styles.feedback}><Feather name="info" size={18} color={Colors.light.accent} /><Text accessibilityLiveRegion="polite" style={styles.feedbackText}>{message}</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flexGrow: 1, padding: 20, paddingBottom: 28, gap: 18, width: "100%", maxWidth: 680, alignSelf: "center" },
  heading: { gap: 6, paddingTop: 8, paddingBottom: 6 },
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
  hiddenCamera: { display: "none" },
  torchButton: { position: "absolute", right: 12, top: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center" },
  cameraOverlay: { flex: 1 },
  shade: { flex: 1, backgroundColor: "rgba(26,29,38,0.5)" },
  finderRow: { flexDirection: "row", height: "38%" },
  viewfinder: { width: "84%" },
  corner: { position: "absolute", width: 26, height: 26, borderColor: Colors.light.surface },
  topLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
  topRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },
  hintArea: { alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  cameraHint: { color: Colors.light.surface, fontSize: 13, lineHeight: 20, textAlign: "center" },
  feedback: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, backgroundColor: Colors.light.accentDim },
  feedbackText: { flex: 1, fontSize: 13, lineHeight: 20, color: Colors.light.textSecondary },
  skeleton: { width: "100%", height: 120, backgroundColor: Colors.light.borderLight, borderRadius: 12 },
});
