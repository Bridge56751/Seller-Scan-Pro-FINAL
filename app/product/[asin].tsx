import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Accelerometer } from "expo-sensors";
import Colors from "@/constants/colors";
import { lookupByAsin, calculateProfit, type ProductData } from "@/lib/mock-data";
import { lookupProductByASIN, fetchKeepaChartData, type KeepaChartData } from "@/lib/api";
import { getCachedProduct } from "@/lib/product-cache";
import { addToScanHistory } from "@/lib/scan-history";
import { BuyRatingPanel } from "@/components/BuyRatingPanel";
import { QuickInfoPanel } from "@/components/QuickInfoPanel";
import { AlertsPanel } from "@/components/AlertsPanel";
import { OffersPanel } from "@/components/OffersPanel";
import { RanksPricesPanel } from "@/components/RanksPricesPanel";
import { ProfitCalculatorPanel } from "@/components/ProfitCalculatorPanel";
import { ChartsPanel } from "@/components/ChartsPanel";

export default function ProductDetailScreen() {
  const { asin } = useLocalSearchParams<{ asin: string }>();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const [costPrice, setCostPrice] = useState(0);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<KeepaChartData | null>(null);
  const [chartsLoading, setChartsLoading] = useState(false);
  const lastShakeRef = useRef(0);

  useEffect(() => {
    if (Platform.OS === "web") return;
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude > 2.5) {
        const now = Date.now();
        if (now - lastShakeRef.current > 1500) {
          lastShakeRef.current = now;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        }
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!asin) { setLoading(false); return; }
    const mock = lookupByAsin(asin);
    if (mock) {
      setProduct(mock);
      setLoading(false);
      return;
    }
    const cached = getCachedProduct(asin);
    if (cached) {
      setProduct(cached);
      setLoading(false);
      return;
    }
    lookupProductByASIN(asin).then((p) => {
      setProduct(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [asin]);

  useEffect(() => {
    if (!asin) return;
    setChartsLoading(true);
    fetchKeepaChartData(asin).then((data) => {
      setChartData(data);
      setChartsLoading(false);
    }).catch(() => setChartsLoading(false));
  }, [asin]);

  useEffect(() => {
    if (product) {
      const calc = calculateProfit(product, 0);
      addToScanHistory({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        asin: product.asin,
        upc: product.upc,
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.buyBoxPrice,
        profit: calc.profit,
        roi: calc.roi,
        bsr: product.categoryRank,
        timestamp: Date.now(),
      });
    }
  }, [product]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.notFound}>
          <Feather name="loader" size={32} color={Colors.light.accent} />
          <Text style={styles.notFoundTitle}>Loading Product...</Text>
          <Text style={styles.notFoundText}>Fetching data from Amazon</Text>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtnFull, pressed && { opacity: 0.8 }, { backgroundColor: Colors.light.textTertiary }]}>
            <Feather name="arrow-left" size={16} color="#FFF" />
            <Text style={styles.backBtnFullText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.notFound}>
          <Feather name="alert-circle" size={40} color={Colors.light.textTertiary} />
          <Text style={styles.notFoundTitle}>Product Not Found</Text>
          <Text style={styles.notFoundText}>No data found for ASIN: {asin}</Text>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtnFull, pressed && { opacity: 0.8 }]}>
            <Feather name="arrow-left" size={16} color="#FFF" />
            <Text style={styles.backBtnFullText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + webTopInset + 4 }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <Feather name="arrow-left" size={20} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>Product Analysis</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <QuickInfoPanel product={product} costPrice={costPrice} onCostChange={setCostPrice} />
        <BuyRatingPanel product={product} costPrice={costPrice} />
        <AlertsPanel product={product} />
        <OffersPanel product={product} costPrice={costPrice} />
        <RanksPricesPanel product={product} />
        <ProfitCalculatorPanel product={product} costPrice={costPrice} />
        <ChartsPanel
          priceHistory={chartData?.priceHistory || []}
          rankHistory={chartData?.rankHistory || []}
          loading={chartsLoading}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    gap: 10,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 40,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 8,
  },
  notFoundText: {
    fontSize: 14,
    color: Colors.light.textTertiary,
    textAlign: "center",
  },
  backBtnFull: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  backBtnFullText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
