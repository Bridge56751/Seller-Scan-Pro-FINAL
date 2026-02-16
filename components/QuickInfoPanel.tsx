import { StyleSheet, Text, View, TextInput } from "react-native";
import { useState, useMemo } from "react";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import type { ProductData } from "@/lib/mock-data";
import { calculateProfit, formatCurrency, formatBSR, estimateSalesPerDay } from "@/lib/mock-data";
import { CollapsiblePanel } from "./CollapsiblePanel";
import Colors from "@/constants/colors";

interface QuickInfoPanelProps {
  product: ProductData;
  costPrice: number;
  onCostChange: (cost: number) => void;
}

export function QuickInfoPanel({ product, costPrice, onCostChange }: QuickInfoPanelProps) {
  const [costInput, setCostInput] = useState(costPrice > 0 ? costPrice.toString() : "");
  const calc = useMemo(() => calculateProfit(product, costPrice), [product, costPrice]);
  const isProfitable = calc.profit > 0 && costPrice > 0;
  const salesPerMonth = estimateSalesPerDay(product.categoryRank, product.category) * 30;

  const handleCostChange = (text: string) => {
    setCostInput(text);
    const val = parseFloat(text);
    onCostChange(isNaN(val) ? 0 : val);
  };

  const eligibilityColor = product.isGated ? Colors.light.red : product.isRestricted ? Colors.light.yellow : Colors.light.green;
  const eligibilityBg = product.isGated ? Colors.light.redBg : product.isRestricted ? Colors.light.yellowBg : Colors.light.greenBg;
  const eligibilityText = product.isGated ? "GATED" : product.isRestricted ? "RESTRICTED" : "ELIGIBLE";

  return (
    <CollapsiblePanel title="Quick Info" icon="zap">
      <View style={styles.productRow}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="contain" />
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
          <View style={styles.asinRow}>
            <Text style={styles.asinLabel}>ASIN:</Text>
            <Text style={styles.asinValue}>{product.asin}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewText}>({product.reviewCount.toLocaleString()} reviews)</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.eligibilityRow}>
        <View style={[styles.eligibilityBadge, { backgroundColor: eligibilityBg }]}>
          <View style={[styles.dot, { backgroundColor: eligibilityColor }]} />
          <Text style={[styles.eligibilityText, { color: eligibilityColor }]}>{eligibilityText}</Text>
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cost Price</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.currencySign}>$</Text>
            <TextInput
              style={styles.input}
              value={costInput}
              onChangeText={handleCostChange}
              placeholder="0.00"
              placeholderTextColor={Colors.light.textTertiary}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Sale Price</Text>
          <View style={[styles.inputWrap, styles.inputDisabled]}>
            <Text style={styles.currencySign}>$</Text>
            <Text style={styles.inputValue}>{product.buyBoxPrice.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.maxCostBanner}>
        <Text style={styles.maxCostLabel}>Max Cost</Text>
        <Text style={styles.maxCostValue}>{formatCurrency(calc.maxCost)}</Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Profit</Text>
          <Text style={[styles.metricValue, costPrice > 0 ? { color: isProfitable ? Colors.light.profit : Colors.light.loss } : null]}>
            {costPrice > 0 ? (calc.profit >= 0 ? "+" : "") + formatCurrency(calc.profit) : "—"}
          </Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>ROI</Text>
          <Text style={[styles.metricValue, costPrice > 0 ? { color: isProfitable ? Colors.light.profit : Colors.light.loss } : null]}>
            {costPrice > 0 ? calc.roi.toFixed(1) + "%" : "—"}
          </Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>BSR</Text>
          <Text style={styles.metricValue}>#{formatBSR(product.categoryRank)}</Text>
          <Text style={styles.metricSub}>{product.category}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Est. Sales/mo</Text>
          <Text style={styles.metricValue}>{salesPerMonth.toLocaleString()}</Text>
        </View>
      </View>
    </CollapsiblePanel>
  );
}

const styles = StyleSheet.create({
  productRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 62,
    height: 62,
  },
  productInfo: {
    flex: 1,
    gap: 3,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
    lineHeight: 18,
  },
  asinRow: {
    flexDirection: "row",
    gap: 4,
  },
  asinLabel: {
    fontSize: 11,
    color: Colors.light.textTertiary,
  },
  asinValue: {
    fontSize: 11,
    color: Colors.light.accent,
    fontWeight: "600" as const,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  reviewText: {
    fontSize: 11,
    color: Colors.light.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 8,
  },
  eligibilityRow: {
    marginBottom: 10,
  },
  eligibilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eligibilityText: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.light.textTertiary,
    marginBottom: 4,
    fontWeight: "500" as const,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 38,
    backgroundColor: "#FFFFFF",
  },
  inputDisabled: {
    backgroundColor: Colors.light.surfaceElevated,
  },
  currencySign: {
    fontSize: 14,
    color: Colors.light.textTertiary,
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    padding: 0,
  },
  inputValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  maxCostBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.successBg,
    borderWidth: 1,
    borderColor: "rgba(22, 163, 74, 0.2)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  maxCostLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.green,
  },
  maxCostValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.green,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metricBox: {
    width: "50%",
    paddingVertical: 6,
    paddingRight: 8,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.light.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  metricSub: {
    fontSize: 10,
    color: Colors.light.textTertiary,
  },
});
