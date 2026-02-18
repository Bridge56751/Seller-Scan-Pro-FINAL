import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { useState, useRef, useCallback } from "react";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { lookupProductByUPC } from "@/lib/api";
import { cacheProduct } from "@/lib/product-cache";

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanLockRef = useRef(false);
  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  const handleBarCodeScanned = useCallback(async (result: BarcodeScanningResult) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;
    const barcode = result.data;
    setScanned(true);
    setLastBarcode(barcode);
    setLookingUp(true);
    setNotFound(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const product = await lookupProductByUPC(barcode);
      if (product) {
        cacheProduct(product);
        router.push({ pathname: "/product/[asin]", params: { asin: product.asin } });
        scanTimeoutRef.current = setTimeout(() => {
          scanLockRef.current = false;
          setScanned(false);
          setLookingUp(false);
        }, 3000);
        return;
      }
      setNotFound(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      setNotFound(true);
    } finally {
      setLookingUp(false);
    }

    scanTimeoutRef.current = setTimeout(() => {
      scanLockRef.current = false;
      setScanned(false);
      setNotFound(false);
    }, 4000);
  }, []);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (!permission) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.centerContent}>
          <Feather name="loader" size={28} color={Colors.light.textTertiary} />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.centerContent}>
          <View style={styles.permIcon}>
            <Feather name="camera-off" size={36} color={Colors.light.textTertiary} />
          </View>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permText}>
            Enable camera to scan product barcodes for instant pricing analysis.
          </Text>
          <Pressable onPress={requestPermission} style={({ pressed }) => [styles.permBtn, pressed && { opacity: 0.85 }]}>
            <Feather name="camera" size={16} color="#FFF" />
            <Text style={styles.permBtnText}>Enable Camera</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={flashOn}
          zoom={0}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      )}

      <View style={styles.overlay}>
        <View style={[styles.topBar, { paddingTop: insets.top + webTopInset + 6 }]}>
          <View style={styles.topLeft}>
            <MaterialCommunityIcons name="barcode-scan" size={22} color="#FFF" />
            <Text style={styles.topTitle}>Seller Scan</Text>
          </View>
          <Pressable
            onPress={() => {
              setFlashOn(!flashOn);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [styles.flashBtn, pressed && { opacity: 0.7 }]}
          >
            <Feather name={flashOn ? "zap" : "zap-off"} size={18} color="#FFF" />
          </Pressable>
        </View>

        <View style={styles.scanFrame}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
        </View>

        <View style={[styles.bottomArea, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 90 }]}>
          {lookingUp ? (
            <View style={[styles.resultBanner, { backgroundColor: "rgba(37,99,235,0.15)" }]}>
              <Feather name="loader" size={16} color={Colors.light.accent} />
              <Text style={[styles.resultTextFail, { color: Colors.light.accent }]}>Looking up {lastBarcode}...</Text>
            </View>
          ) : notFound ? (
            <View style={styles.resultBanner}>
              <Feather name="x-circle" size={16} color={Colors.light.loss} />
              <Text style={styles.resultTextFail}>Not on Amazon: {lastBarcode}</Text>
            </View>
          ) : scanned ? (
            <View style={[styles.resultBanner, { backgroundColor: "rgba(22,163,74,0.15)" }]}>
              <Feather name="check-circle" size={16} color={Colors.light.profit} />
              <Text style={[styles.resultTextFail, { color: Colors.light.profit }]}>Product found!</Text>
            </View>
          ) : (
            <Text style={styles.instructionText}>Align barcode within the frame</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const CS = 22;
const CW = 3;
const FRAME_W = 260;
const FRAME_H = 150;

const cornerBase = {
  position: "absolute" as const,
  width: CS,
  height: CS,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: Colors.light.background,
  },
  permIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  permTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: "center",
  },
  permText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  permBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permBtnText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#FFF",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: Colors.light.accent,
  },
  topLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#FFF",
    letterSpacing: -0.3,
  },
  flashBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: FRAME_W,
    height: FRAME_H,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  cornerTL: {
    ...cornerBase,
    top: 0, left: 0,
    borderTopWidth: CW, borderLeftWidth: CW,
    borderColor: "#FFF",
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    ...cornerBase,
    top: 0, right: 0,
    borderTopWidth: CW, borderRightWidth: CW,
    borderColor: "#FFF",
    borderTopRightRadius: 4,
  },
  cornerBL: {
    ...cornerBase,
    bottom: 0, left: 0,
    borderBottomWidth: CW, borderLeftWidth: CW,
    borderColor: "#FFF",
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    ...cornerBase,
    bottom: 0, right: 0,
    borderBottomWidth: CW, borderRightWidth: CW,
    borderColor: "#FFF",
    borderBottomRightRadius: 4,
  },
  scanLine: {
    width: FRAME_W - 16,
    height: 2,
    backgroundColor: Colors.light.accent,
    borderRadius: 1,
    shadowColor: Colors.light.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
  },
  instructionText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500" as const,
  },
  resultBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(220,38,38,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resultTextFail: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.loss,
  },
});
