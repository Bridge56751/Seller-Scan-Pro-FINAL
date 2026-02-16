import { StyleSheet, Text, View, Pressable } from "react-native";
import { useState, useMemo } from "react";
import type { ProductData } from "@/lib/mock-data";
import { formatCurrency, formatBSR, estimateSalesPerDay } from "@/lib/mock-data";
import { CollapsiblePanel } from "./CollapsiblePanel";
import Colors from "@/constants/colors";

interface RanksPricesPanelProps {
  product: ProductData;
}

type TimeRange = "current" | "30" | "90" | "180";

export function RanksPricesPanel({ product }: RanksPricesPanelProps) {
  const [range, setRange] = useState<TimeRange>("current");

  const rangeData = useMemo(() => {
    if (range === "current") {
      return {
        bsr: product.categoryRank,
        buyBox: product.buyBoxPrice,
        amazon: product.amazonPrice,
        lowestFBA: product.lowestNewPrice,
        lowestFBM: product.lowestNewPrice + 2,
      };
    }
    const days = parseInt(range);
    const rankSlice = product.rankHistory.slice(-days);
    const priceSlice = product.priceHistory.slice(-days);
    const avgRank = rankSlice.length > 0 ? Math.round(rankSlice.reduce((a, b) => a + b.rank, 0) / rankSlice.length) : product.categoryRank;
    const avgBuyBox = priceSlice.length > 0 ? Math.round((priceSlice.reduce((a, b) => a + b.buyBox, 0) / priceSlice.length) * 100) / 100 : product.buyBoxPrice;
    const amazonPrices = priceSlice.map(p => p.amazon).filter((p): p is number => p !== null);
    const avgAmazon = amazonPrices.length > 0 ? Math.round((amazonPrices.reduce((a, b) => a + b, 0) / amazonPrices.length) * 100) / 100 : null;
    const avgNew = priceSlice.length > 0 ? Math.round((priceSlice.reduce((a, b) => a + b.newPrice, 0) / priceSlice.length) * 100) / 100 : product.lowestNewPrice;

    return {
      bsr: avgRank,
      buyBox: avgBuyBox,
      amazon: avgAmazon,
      lowestFBA: avgNew,
      lowestFBM: avgNew + 2,
    };
  }, [range, product]);

  const salesPerDay = estimateSalesPerDay(rangeData.bsr, product.category);

  return (
    <CollapsiblePanel title="Ranks & Prices" icon="bar-chart-2">
      <View style={styles.rangeTabs}>
        {([["current", "Current"], ["30", "30 Day"], ["90", "90 Day"], ["180", "All"]] as [TimeRange, string][]).map(([key, label]) => (
          <Pressable key={key} onPress={() => setRange(key)} style={[styles.rangeTab, range === key && styles.rangeTabActive]}>
            <Text style={[styles.rangeTabText, range === key && styles.rangeTabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.dataGrid}>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>BSR</Text>
          <Text style={styles.dataValue}>#{formatBSR(rangeData.bsr)}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Category</Text>
          <Text style={styles.dataValue}>{product.category}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Buy Box</Text>
          <Text style={styles.dataValue}>{formatCurrency(rangeData.buyBox)}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Amazon</Text>
          <Text style={[styles.dataValue, { color: Colors.light.amazon }]}>
            {rangeData.amazon !== null ? formatCurrency(rangeData.amazon) : "—"}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Lowest FBA</Text>
          <Text style={[styles.dataValue, { color: Colors.light.fba }]}>{formatCurrency(rangeData.lowestFBA)}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Lowest FBM</Text>
          <Text style={[styles.dataValue, { color: Colors.light.fbm }]}>{formatCurrency(rangeData.lowestFBM)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Est. Sales/day</Text>
          <Text style={styles.dataValue}>{salesPerDay}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Est. Sales/month</Text>
          <Text style={[styles.dataValue, { fontWeight: "700" as const }]}>{(salesPerDay * 30).toLocaleString()}</Text>
        </View>
      </View>
    </CollapsiblePanel>
  );
}

const styles = StyleSheet.create({
  rangeTabs: {
    flexDirection: "row",
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: 6,
    padding: 2,
    marginBottom: 12,
  },
  rangeTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 5,
  },
  rangeTabActive: {
    backgroundColor: Colors.light.accent,
  },
  rangeTabText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.textTertiary,
  },
  rangeTabTextActive: {
    color: "#FFFFFF",
  },
  dataGrid: {},
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  dataLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  dataValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: 4,
  },
});
