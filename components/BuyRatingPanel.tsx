import { StyleSheet, Text, View } from "react-native";
import { useMemo } from "react";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { CollapsiblePanel } from "./CollapsiblePanel";
import type { ProductData } from "@/lib/mock-data";

interface BuyRatingPanelProps {
  product: ProductData;
  costPrice: number;
}

function calculateBuyRating(product: ProductData, costPrice: number) {
  let score = 0;
  const factors: { label: string; points: number; status: "good" | "warn" | "bad" }[] = [];

  const rank = product.categoryRank;
  if (rank > 0 && rank <= 5000) {
    score += 20;
    factors.push({ label: "Sales Rank (Top 5K)", points: 20, status: "good" });
  } else if (rank > 0 && rank <= 20000) {
    score += 15;
    factors.push({ label: "Sales Rank (Top 20K)", points: 15, status: "good" });
  } else if (rank > 0 && rank <= 50000) {
    score += 10;
    factors.push({ label: "Sales Rank (Top 50K)", points: 10, status: "warn" });
  } else if (rank > 0 && rank <= 100000) {
    score += 5;
    factors.push({ label: "Sales Rank (Top 100K)", points: 5, status: "warn" });
  } else if (rank > 100000) {
    score += 0;
    factors.push({ label: "Sales Rank (100K+)", points: 0, status: "bad" });
  } else {
    score += 5;
    factors.push({ label: "Sales Rank (Unknown)", points: 5, status: "warn" });
  }

  const monthly = product.estimatedMonthlySales;
  if (monthly >= 300) {
    score += 20;
    factors.push({ label: "Sales Volume (300+/mo)", points: 20, status: "good" });
  } else if (monthly >= 100) {
    score += 15;
    factors.push({ label: "Sales Volume (100+/mo)", points: 15, status: "good" });
  } else if (monthly >= 30) {
    score += 10;
    factors.push({ label: "Sales Volume (30+/mo)", points: 10, status: "warn" });
  } else if (monthly > 0) {
    score += 3;
    factors.push({ label: "Sales Volume (Low)", points: 3, status: "bad" });
  } else {
    score += 0;
    factors.push({ label: "Sales Volume (None)", points: 0, status: "bad" });
  }

  let alertPenalty = 0;
  if (product.isHazmat) { alertPenalty += 10; factors.push({ label: "Hazmat Item", points: -10, status: "bad" }); }
  if (product.isGated) { alertPenalty += 10; factors.push({ label: "Gated Category", points: -10, status: "bad" }); }
  if (product.hasIPComplaints) { alertPenalty += 8; factors.push({ label: "IP Complaints", points: -8, status: "bad" }); }
  if (product.isOversized) { alertPenalty += 5; factors.push({ label: "Oversized", points: -5, status: "warn" }); }
  if (product.isRestricted) { alertPenalty += 10; factors.push({ label: "Restricted", points: -10, status: "bad" }); }
  if (alertPenalty === 0) {
    score += 12;
    factors.push({ label: "No Alerts", points: 12, status: "good" });
  } else {
    score = Math.max(0, score - alertPenalty);
  }

  if (costPrice > 0 && product.buyBoxPrice > 0) {
    const profit = product.buyBoxPrice - costPrice - product.totalFees;
    const roi = (profit / costPrice) * 100;
    if (roi >= 100) {
      score += 15;
      factors.push({ label: "ROI 100%+", points: 15, status: "good" });
    } else if (roi >= 50) {
      score += 12;
      factors.push({ label: "ROI 50%+", points: 12, status: "good" });
    } else if (roi >= 20) {
      score += 8;
      factors.push({ label: "ROI 20%+", points: 8, status: "warn" });
    } else if (roi > 0) {
      score += 3;
      factors.push({ label: "ROI Low", points: 3, status: "warn" });
    } else {
      score += 0;
      factors.push({ label: "Negative ROI", points: 0, status: "bad" });
    }
  }

  score = Math.min(67, Math.max(0, score));

  let verdict: string;
  let verdictColor: string;
  let verdictBg: string;
  if (score >= 50) {
    verdict = "67";
    verdictColor = Colors.light.green;
    verdictBg = Colors.light.greenBg;
  } else if (score >= 35) {
    verdict = "SOLID BUY";
    verdictColor = Colors.light.green;
    verdictBg = Colors.light.greenBg;
  } else if (score >= 20) {
    verdict = "MAYBE";
    verdictColor = Colors.light.yellow;
    verdictBg = Colors.light.yellowBg;
  } else {
    verdict = "BUM BUY";
    verdictColor = Colors.light.red;
    verdictBg = Colors.light.redBg;
  }

  return { score, factors, verdict, verdictColor, verdictBg };
}

export function BuyRatingPanel({ product, costPrice }: BuyRatingPanelProps) {
  const rating = useMemo(() => calculateBuyRating(product, costPrice), [product, costPrice]);

  const barWidth = Math.round((rating.score / 67) * 100);

  const barColor = rating.score >= 50
    ? Colors.light.green
    : rating.score >= 35
      ? "#84CC16"
      : rating.score >= 20
        ? Colors.light.yellow
        : Colors.light.red;

  return (
    <CollapsiblePanel
      title="BUY RATING"
      icon="zap"
      badge={{ text: rating.verdict, color: rating.verdictColor, bg: rating.verdictBg }}
    >
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>Score</Text>
        <Text style={[styles.scoreValue, { color: rating.verdictColor }]}>{rating.score} / 67</Text>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: barColor }]} />
        <View style={[styles.barMarker, { left: "29.8%" }]} />
        <View style={[styles.barMarker, { left: "52.2%" }]} />
        <View style={[styles.barMarker, { left: "74.6%" }]} />
      </View>
      <View style={styles.barLabels}>
        <Text style={[styles.barLabel, { color: Colors.light.red }]}>Bum Buy</Text>
        <Text style={[styles.barLabel, { color: Colors.light.yellow }]}>Maybe</Text>
        <Text style={[styles.barLabel, { color: "#84CC16" }]}>Solid</Text>
        <Text style={[styles.barLabel, { color: Colors.light.green }]}>67</Text>
      </View>

      <View style={styles.factorList}>
        {rating.factors.map((f, i) => (
          <View key={i} style={styles.factorRow}>
            <View style={styles.factorLeft}>
              <View style={[styles.dot, {
                backgroundColor: f.status === "good" ? Colors.light.green : f.status === "warn" ? Colors.light.yellow : Colors.light.red
              }]} />
              <Text style={styles.factorLabel}>{f.label}</Text>
            </View>
            <Text style={[styles.factorPoints, {
              color: f.points > 0 ? Colors.light.green : f.points < 0 ? Colors.light.red : Colors.light.textTertiary
            }]}>
              {f.points > 0 ? `+${f.points}` : f.points === 0 ? "0" : `${f.points}`}
            </Text>
          </View>
        ))}
      </View>
    </CollapsiblePanel>
  );
}

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: "700" as const,
  },
  barTrack: {
    height: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 4,
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
  },
  barMarker: {
    position: "absolute",
    top: 0,
    width: 1.5,
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  factorList: {
    gap: 6,
  },
  factorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  factorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  factorLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  factorPoints: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
});
