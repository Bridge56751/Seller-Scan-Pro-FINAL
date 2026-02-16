import { StyleSheet, Text, View, TextInput, Platform } from "react-native";
import { useState, useMemo } from "react";
import { Feather } from "@expo/vector-icons";
import type { ProductData } from "@/lib/mock-data";
import { calculateProfit, formatCurrency } from "@/lib/mock-data";
import Colors from "@/constants/colors";

interface ProfitCardProps {
  product: ProductData;
}

export function ProfitCard({ product }: ProfitCardProps) {
  const [costInput, setCostInput] = useState("");
  const costPrice = parseFloat(costInput) || 0;
  const calc = useMemo(() => calculateProfit(product, costPrice), [product, costPrice]);

  const isProfitable = calc.profit > 0;
  const profitColor = isProfitable ? Colors.dark.profit : Colors.dark.loss;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profitability</Text>
        <View style={[styles.badge, { backgroundColor: isProfitable && costPrice > 0 ? Colors.dark.successDim : costPrice > 0 ? Colors.dark.dangerDim : Colors.dark.accentDim }]}>
          <Text style={[styles.badgeText, { color: isProfitable && costPrice > 0 ? Colors.dark.success : costPrice > 0 ? Colors.dark.danger : Colors.dark.accent }]}>
            {costPrice > 0 ? (isProfitable ? "PROFITABLE" : "LOSS") : "ENTER COST"}
          </Text>
        </View>
      </View>

      <View style={styles.costRow}>
        <Text style={styles.costLabel}>Your Cost</Text>
        <View style={styles.costInputWrap}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={styles.costInput}
            value={costInput}
            onChangeText={setCostInput}
            placeholder="0.00"
            placeholderTextColor={Colors.dark.textTertiary}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </View>
      </View>

      <View style={styles.maxCostRow}>
        <Feather name="arrow-up-circle" size={14} color={Colors.dark.tint} />
        <Text style={styles.maxCostLabel}>Max Cost for Profit</Text>
        <Text style={styles.maxCostValue}>{formatCurrency(calc.maxCost)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Sale Price</Text>
          <Text style={styles.metricValue}>{formatCurrency(product.buyBoxPrice)}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Total Fees</Text>
          <Text style={[styles.metricValue, { color: Colors.dark.warning }]}>-{formatCurrency(product.totalFees)}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Profit</Text>
          <Text style={[styles.metricValue, { color: costPrice > 0 ? profitColor : Colors.dark.text }]}>
            {costPrice > 0 ? (calc.profit >= 0 ? "+" : "-") + formatCurrency(calc.profit) : "--"}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>ROI</Text>
          <Text style={[styles.metricValue, { color: costPrice > 0 ? profitColor : Colors.dark.text }]}>
            {costPrice > 0 ? calc.roi.toFixed(1) + "%" : "--"}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.feeBreakdown}>
        <Text style={styles.feeTitle}>Fee Breakdown</Text>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Referral Fee</Text>
          <Text style={styles.feeValue}>{formatCurrency(product.referralFee)}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>FBA Fee</Text>
          <Text style={styles.feeValue}>{formatCurrency(product.fbaFees)}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Storage Fee</Text>
          <Text style={styles.feeValue}>{formatCurrency(product.storageFee)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.dark.text,
    fontFamily: Platform.select({ ios: "Inter_700Bold", android: "Inter_700Bold", default: undefined }),
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  costInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  dollarSign: {
    fontSize: 16,
    color: Colors.dark.textTertiary,
    marginRight: 2,
  },
  costInput: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: "600" as const,
    flex: 1,
    padding: 0,
  },
  maxCostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.dark.tintDim,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  maxCostLabel: {
    fontSize: 13,
    color: Colors.dark.tint,
    flex: 1,
  },
  maxCostValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.dark.tint,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
  },
  metricItem: {
    width: "50%",
    paddingVertical: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.dark.textTertiary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.dark.text,
  },
  feeBreakdown: {
    gap: 6,
  },
  feeTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  feeLabel: {
    fontSize: 13,
    color: Colors.dark.textTertiary,
  },
  feeValue: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontWeight: "500" as const,
  },
});
