import { StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import type { ProductData } from "@/lib/mock-data";
import { calculateProfit, formatCurrency } from "@/lib/mock-data";
import { CollapsiblePanel } from "./CollapsiblePanel";
import Colors from "@/constants/colors";

interface ProfitCalculatorPanelProps {
  product: ProductData;
  costPrice: number;
}

export function ProfitCalculatorPanel({ product, costPrice }: ProfitCalculatorPanelProps) {
  const calc = useMemo(() => calculateProfit(product, costPrice), [product, costPrice]);
  const isProfitable = calc.profit > 0 && costPrice > 0;

  return (
    <CollapsiblePanel
      title="Profit Calculator"
      icon="dollar-sign"
      badge={costPrice > 0 ? {
        text: isProfitable ? "PROFITABLE" : "LOSS",
        color: isProfitable ? Colors.light.green : Colors.light.red,
        bg: isProfitable ? Colors.light.greenBg : Colors.light.redBg,
      } : undefined}
    >
      <View style={styles.summaryRow}>
        <View style={[styles.summaryBox, { backgroundColor: isProfitable && costPrice > 0 ? Colors.light.greenBg : costPrice > 0 ? Colors.light.redBg : Colors.light.surfaceElevated }]}>
          <Text style={styles.summaryLabel}>Net Profit</Text>
          <Text style={[styles.summaryValue, costPrice > 0 ? { color: isProfitable ? Colors.light.profit : Colors.light.loss } : null]}>
            {costPrice > 0 ? (calc.profit >= 0 ? "+" : "") + formatCurrency(calc.profit) : "—"}
          </Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: isProfitable && costPrice > 0 ? Colors.light.greenBg : costPrice > 0 ? Colors.light.redBg : Colors.light.surfaceElevated }]}>
          <Text style={styles.summaryLabel}>ROI</Text>
          <Text style={[styles.summaryValue, costPrice > 0 ? { color: isProfitable ? Colors.light.profit : Colors.light.loss } : null]}>
            {costPrice > 0 ? calc.roi.toFixed(1) + "%" : "—"}
          </Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: Colors.light.surfaceElevated }]}>
          <Text style={styles.summaryLabel}>Margin</Text>
          <Text style={styles.summaryValue}>
            {costPrice > 0 ? calc.margin.toFixed(1) + "%" : "—"}
          </Text>
        </View>
      </View>

      <View style={styles.breakdown}>
        <Text style={styles.breakdownTitle}>Breakdown</Text>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Sale Price (Buy Box)</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(product.buyBoxPrice)}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Your Cost</Text>
          <Text style={styles.breakdownValue}>{costPrice > 0 ? "-" + formatCurrency(costPrice) : "—"}</Text>
        </View>

        <View style={styles.feeDivider} />
        <Text style={styles.feesSectionTitle}>Amazon Fees</Text>

        <View style={styles.breakdownRow}>
          <Text style={styles.feeLabel}>Referral Fee ({((product.referralFee / product.buyBoxPrice) * 100).toFixed(0)}%)</Text>
          <Text style={styles.feeValue}>-{formatCurrency(product.referralFee)}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.feeLabel}>FBA Fulfillment Fee</Text>
          <Text style={styles.feeValue}>-{formatCurrency(product.fbaFees)}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.feeLabel}>Monthly Storage Fee</Text>
          <Text style={styles.feeValue}>-{formatCurrency(product.storageFee)}</Text>
        </View>

        <View style={styles.feeDivider} />

        <View style={styles.breakdownRow}>
          <Text style={styles.totalFeeLabel}>Total Fees</Text>
          <Text style={[styles.totalFeeValue, { color: Colors.light.loss }]}>-{formatCurrency(product.totalFees)}</Text>
        </View>

        <View style={styles.feeDivider} />

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Breakeven Price</Text>
          <Text style={styles.breakdownValue}>{formatCurrency(calc.breakeven + costPrice)}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Max Cost (for profit)</Text>
          <Text style={[styles.breakdownValue, { color: Colors.light.green, fontWeight: "700" as const }]}>{formatCurrency(calc.maxCost)}</Text>
        </View>
      </View>
    </CollapsiblePanel>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  summaryBox: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.light.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  breakdown: {},
  breakdownTitle: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.light.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 13,
    color: Colors.light.text,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  feeDivider: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginVertical: 6,
  },
  feesSectionTitle: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.textTertiary,
    marginBottom: 4,
  },
  feeLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  feeValue: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  totalFeeLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  totalFeeValue: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
});
