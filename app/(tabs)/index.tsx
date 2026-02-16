import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { useState, useRef, useCallback } from "react";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, withRepeat, withTiming, withSequence } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { lookupByBarcode } from "@/lib/mock-data";

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastBarcode, setLastBarcode] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBarCodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (scanned) return;
    const barcode = result.data;
    setScanned(true);
    setLastBarcode(barcode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const product = lookupByBarcode(barcode);
    if (product) {
      router.push({ pathname: "/product/[asin]", params: { asin: product.asin } });
    }

    scanTimeoutRef.current = setTimeout(() => {
      setScanned(false);
    }, 2000);
  }, [scanned]);

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (!permission) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.centerContent}>
          <Feather name="loader" size={32} color={Colors.dark.textTertiary} />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.centerContent}>
          <View style={styles.permissionIcon}>
            <Feather name="camera-off" size={48} color={Colors.dark.textTertiary} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            ScanProfit needs your camera to scan product barcodes and look up pricing data.
          </Text>
          <Pressable onPress={requestPermission} style={({ pressed }) => [styles.permissionBtn, pressed && { opacity: 0.8 }]}>
            <Feather name="camera" size={18} color={Colors.dark.background} />
            <Text style={styles.permissionBtnText}>Enable Camera</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashOn}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.overlay}>
        <View style={[styles.topBar, { paddingTop: insets.top + webTopInset + 8 }]}>
          <Text style={styles.topTitle}>ScanProfit</Text>
          <Pressable
            onPress={() => {
              setFlashOn(!flashOn);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [styles.flashBtn, pressed && { opacity: 0.7 }]}
          >
            <Feather name={flashOn ? "zap" : "zap-off"} size={20} color="#FFF" />
          </Pressable>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
          <ScanLine />
        </View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 90 }]}>
          {lastBarcode && !scanned ? (
            <View style={styles.resultBanner}>
              <MaterialCommunityIcons name="barcode" size={18} color={Colors.dark.tint} />
              <Text style={styles.resultText}>No product found for: {lastBarcode}</Text>
            </View>
          ) : scanned ? (
            <View style={styles.resultBanner}>
              <Feather name="check-circle" size={18} color={Colors.dark.tint} />
              <Text style={styles.resultText}>Product found! Loading...</Text>
            </View>
          ) : (
            <Text style={styles.instructionText}>Point camera at a product barcode</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function ScanLine() {
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withRepeat(
          withSequence(
            withTiming(-60, { duration: 1500 }),
            withTiming(60, { duration: 1500 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.scanLine, animStyle]} />
  );
}

const CORNER_SIZE = 24;
const CORNER_WIDTH = 3;
const SCAN_AREA_SIZE = 260;

const cornerBase = {
  position: "absolute" as const,
  width: CORNER_SIZE,
  height: CORNER_SIZE,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.dark.text,
    marginBottom: 10,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  permissionBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.dark.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "rgba(10, 14, 26, 0.6)",
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  flashBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE * 0.6,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  cornerTL: {
    ...cornerBase,
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: Colors.dark.tint,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    ...cornerBase,
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: Colors.dark.tint,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    ...cornerBase,
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: Colors.dark.tint,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    ...cornerBase,
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: Colors.dark.tint,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    width: SCAN_AREA_SIZE - 20,
    height: 2,
    backgroundColor: Colors.dark.tint,
    borderRadius: 1,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "rgba(10, 14, 26, 0.7)",
    alignItems: "center",
  },
  instructionText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500" as const,
  },
  resultBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dark.tintDim,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resultText: {
    fontSize: 14,
    color: Colors.dark.tint,
    fontWeight: "500" as const,
  },
});
