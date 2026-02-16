import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { lookupByAsin, calculateProfit, type ProductData } from "@/lib/mock-data";
import { addToScanHistory } from "@/lib/scan-history";
import { ProductHeader } from "@/components/ProductHeader";
import { ProfitCard } from "@/components/ProfitCard";
import { PriceChart } from "@/components/PriceChart";
import { CompetitorList } from "@/components/CompetitorList";
import { AlertBanner } from "@/components/AlertBanner";

export default function ProductDetailScreen() {
  const { asin } = useLocalSearchParams<{ asin: string }>();
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const product = useMemo(() => {
    if (!asin) return null;
    return lookupByAsin(asin);
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

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.notFound}>
          <Feather name="alert-circle" size={48} color={Colors.dark.textTertiary} />
          <Text style={styles.notFoundTitle}>Product Not Found</Text>
          <Text style={styles.notFoundText}>We couldn't find data for ASIN: {asin}</Text>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}>
            <Feather name="arrow-left" size={18} color={Colors.dark.background} />
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topNav, { paddingTop: insets.top + webTopInset + 4 }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.7 }]}
        >
          <Feather name="arrow-left" size={22} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1}>{product.brand}</Text>
        <View style={styles.navBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {product.alerts.length > 0 && (
          <AlertBanner alerts={product.alerts} />
        )}
        <ProductHeader product={product} />
        <ProfitCard product={product} />
        <PriceChart priceHistory={product.priceHistory} rankHistory={product.rankHistory} />
        <CompetitorList
          competitors={product.competitors}
          buyBoxPrice={product.buyBoxPrice}
          fbaSellerCount={product.fbaSellerCount}
          fbmSellerCount={product.fbmSellerCount}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    backgroundColor: Colors.dark.background,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.dark.text,
    flex: 1,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 40,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.dark.text,
    marginTop: 8,
  },
  notFoundText: {
    fontSize: 14,
    color: Colors.dark.textTertiary,
    textAlign: "center",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.dark.background,
  },
});
