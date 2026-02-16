import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { useState, useMemo } from "react";
import Svg, { Path, Line, Text as SvgText, Circle } from "react-native-svg";
import type { PricePoint, RankPoint } from "@/lib/mock-data";
import Colors from "@/constants/colors";

interface PriceChartProps {
  priceHistory: PricePoint[];
  rankHistory: RankPoint[];
}

type ChartMode = "price" | "rank";
type TimeRange = "30" | "60" | "90";

export function PriceChart({ priceHistory, rankHistory }: PriceChartProps) {
  const [mode, setMode] = useState<ChartMode>("price");
  const [range, setRange] = useState<TimeRange>("90");

  const rangeNum = parseInt(range);
  const chartWidth = 320;
  const chartHeight = 140;
  const padLeft = 50;
  const padRight = 10;
  const padTop = 10;
  const padBottom = 25;
  const drawW = chartWidth - padLeft - padRight;
  const drawH = chartHeight - padTop - padBottom;

  const filteredPrices = useMemo(() => priceHistory.slice(-rangeNum), [priceHistory, rangeNum]);
  const filteredRanks = useMemo(() => rankHistory.slice(-rangeNum), [rankHistory, rangeNum]);

  const priceChartData = useMemo(() => {
    if (filteredPrices.length === 0) return null;
    const buyBoxPrices = filteredPrices.map((p) => p.buyBox);
    const amazonPrices = filteredPrices.map((p) => p.amazon).filter((p): p is number => p !== null);
    const allPrices = [...buyBoxPrices, ...amazonPrices];
    const minP = Math.min(...allPrices) * 0.95;
    const maxP = Math.max(...allPrices) * 1.05;
    const rangeP = maxP - minP || 1;

    const toPath = (prices: (number | null)[]) => {
      let path = "";
      let started = false;
      prices.forEach((p, i) => {
        if (p === null) return;
        const x = padLeft + (i / Math.max(prices.length - 1, 1)) * drawW;
        const y = padTop + (1 - (p - minP) / rangeP) * drawH;
        if (!started) {
          path += `M${x},${y}`;
          started = true;
        } else {
          path += ` L${x},${y}`;
        }
      });
      return path;
    };

    return {
      buyBoxPath: toPath(buyBoxPrices),
      amazonPath: toPath(filteredPrices.map((p) => p.amazon)),
      minP,
      maxP,
      lastBuyBox: buyBoxPrices[buyBoxPrices.length - 1],
      lastAmazon: amazonPrices.length > 0 ? amazonPrices[amazonPrices.length - 1] : null,
    };
  }, [filteredPrices, drawW, drawH, padLeft, padTop]);

  const rankChartData = useMemo(() => {
    if (filteredRanks.length === 0) return null;
    const ranks = filteredRanks.map((r) => r.rank);
    const minR = Math.min(...ranks) * 0.8;
    const maxR = Math.max(...ranks) * 1.2;
    const rangeR = maxR - minR || 1;

    let path = "";
    ranks.forEach((r, i) => {
      const x = padLeft + (i / Math.max(ranks.length - 1, 1)) * drawW;
      const y = padTop + ((r - minR) / rangeR) * drawH;
      if (i === 0) path += `M${x},${y}`;
      else path += ` L${x},${y}`;
    });

    return { path, minR, maxR, lastRank: ranks[ranks.length - 1] };
  }, [filteredRanks, drawW, drawH, padLeft, padTop]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.modeToggle}>
          <Pressable onPress={() => setMode("price")} style={[styles.modeBtn, mode === "price" && styles.modeBtnActive]}>
            <Text style={[styles.modeBtnText, mode === "price" && styles.modeBtnTextActive]}>Price</Text>
          </Pressable>
          <Pressable onPress={() => setMode("rank")} style={[styles.modeBtn, mode === "rank" && styles.modeBtnActive]}>
            <Text style={[styles.modeBtnText, mode === "rank" && styles.modeBtnTextActive]}>BSR</Text>
          </Pressable>
        </View>
        <View style={styles.rangeToggle}>
          {(["30", "60", "90"] as TimeRange[]).map((r) => (
            <Pressable key={r} onPress={() => setRange(r)} style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}>
              <Text style={[styles.rangeBtnText, range === r && styles.rangeBtnTextActive]}>{r}d</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
        <Line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + drawH} stroke={Colors.dark.border} strokeWidth={1} />
        <Line x1={padLeft} y1={padTop + drawH} x2={padLeft + drawW} y2={padTop + drawH} stroke={Colors.dark.border} strokeWidth={1} />
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <Line key={f} x1={padLeft} y1={padTop + f * drawH} x2={padLeft + drawW} y2={padTop + f * drawH} stroke={Colors.dark.border} strokeWidth={0.5} strokeDasharray="4,4" opacity={0.4} />
        ))}

        {mode === "price" && priceChartData && (
          <>
            <Path d={priceChartData.amazonPath} stroke="#FF9500" strokeWidth={1.5} fill="none" opacity={0.7} />
            <Path d={priceChartData.buyBoxPath} stroke={Colors.dark.tint} strokeWidth={2} fill="none" />
            <SvgText x={padLeft - 4} y={padTop + 4} textAnchor="end" fontSize={9} fill={Colors.dark.textTertiary}>
              ${priceChartData.maxP.toFixed(0)}
            </SvgText>
            <SvgText x={padLeft - 4} y={padTop + drawH + 4} textAnchor="end" fontSize={9} fill={Colors.dark.textTertiary}>
              ${priceChartData.minP.toFixed(0)}
            </SvgText>
          </>
        )}

        {mode === "rank" && rankChartData && (
          <>
            <Path d={rankChartData.path} stroke={Colors.dark.accent} strokeWidth={2} fill="none" />
            <SvgText x={padLeft - 4} y={padTop + 4} textAnchor="end" fontSize={9} fill={Colors.dark.textTertiary}>
              {Math.round(rankChartData.minR).toLocaleString()}
            </SvgText>
            <SvgText x={padLeft - 4} y={padTop + drawH + 4} textAnchor="end" fontSize={9} fill={Colors.dark.textTertiary}>
              {Math.round(rankChartData.maxR).toLocaleString()}
            </SvgText>
          </>
        )}

        <SvgText x={padLeft + 2} y={padTop + drawH + 16} fontSize={9} fill={Colors.dark.textTertiary}>{rangeNum}d ago</SvgText>
        <SvgText x={padLeft + drawW} y={padTop + drawH + 16} textAnchor="end" fontSize={9} fill={Colors.dark.textTertiary}>Today</SvgText>
      </Svg>

      {mode === "price" && priceChartData && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.dark.tint }]} />
            <Text style={styles.legendText}>Buy Box ${priceChartData.lastBuyBox?.toFixed(2)}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FF9500" }]} />
            <Text style={styles.legendText}>Amazon {priceChartData.lastAmazon ? "$" + priceChartData.lastAmazon.toFixed(2) : "N/A"}</Text>
          </View>
        </View>
      )}
      {mode === "rank" && rankChartData && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.dark.accent }]} />
            <Text style={styles.legendText}>BSR #{rankChartData.lastRank?.toLocaleString()}</Text>
          </View>
        </View>
      )}
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
    marginBottom: 12,
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 8,
    padding: 2,
  },
  modeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modeBtnActive: {
    backgroundColor: Colors.dark.tint,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.dark.textTertiary,
  },
  modeBtnTextActive: {
    color: Colors.dark.background,
  },
  rangeToggle: {
    flexDirection: "row",
    gap: 4,
  },
  rangeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rangeBtnActive: {
    backgroundColor: Colors.dark.surfaceElevated,
  },
  rangeBtnText: {
    fontSize: 11,
    color: Colors.dark.textTertiary,
    fontWeight: "500" as const,
  },
  rangeBtnTextActive: {
    color: Colors.dark.text,
  },
  chart: {
    alignSelf: "center",
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
});
