import { StyleSheet, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useState, useMemo } from "react";
import Svg, { Path, Line, Text as SvgText, Rect } from "react-native-svg";
import type { PricePoint, RankPoint } from "@/lib/mock-data";
import { CollapsiblePanel } from "./CollapsiblePanel";
import Colors from "@/constants/colors";

interface ChartsPanelProps {
  priceHistory: PricePoint[];
  rankHistory: RankPoint[];
  loading?: boolean;
}

type ChartMode = "price" | "rank";
type TimeRange = "30" | "90" | "180";

export function ChartsPanel({ priceHistory, rankHistory, loading }: ChartsPanelProps) {
  const [mode, setMode] = useState<ChartMode>("price");
  const [range, setRange] = useState<TimeRange>("90");

  const rangeNum = parseInt(range);
  const chartWidth = 310;
  const chartHeight = 150;
  const padLeft = 48;
  const padRight = 8;
  const padTop = 12;
  const padBottom = 22;
  const drawW = chartWidth - padLeft - padRight;
  const drawH = chartHeight - padTop - padBottom;

  const filteredPrices = useMemo(() => priceHistory.slice(-rangeNum), [priceHistory, rangeNum]);
  const filteredRanks = useMemo(() => rankHistory.slice(-rangeNum), [rankHistory, rangeNum]);

  const priceChartData = useMemo(() => {
    if (filteredPrices.length === 0) return null;
    const buyBoxPrices = filteredPrices.map((p) => p.buyBox);
    const amazonPrices = filteredPrices.map((p) => p.amazon).filter((p): p is number => p !== null);
    const newPrices = filteredPrices.map((p) => p.newPrice);
    const allPrices = [...buyBoxPrices, ...amazonPrices, ...newPrices];
    const minP = Math.min(...allPrices) * 0.97;
    const maxP = Math.max(...allPrices) * 1.03;
    const rangeP = maxP - minP || 1;

    const toPath = (prices: (number | null)[]) => {
      let path = "";
      let started = false;
      prices.forEach((p, i) => {
        if (p === null) return;
        const x = padLeft + (i / Math.max(prices.length - 1, 1)) * drawW;
        const y = padTop + (1 - (p - minP) / rangeP) * drawH;
        if (!started) { path += `M${x},${y}`; started = true; }
        else path += ` L${x},${y}`;
      });
      return path;
    };

    return {
      buyBoxPath: toPath(buyBoxPrices),
      amazonPath: toPath(filteredPrices.map((p) => p.amazon)),
      fbaPath: toPath(newPrices),
      minP, maxP,
    };
  }, [filteredPrices, drawW, drawH, padLeft, padTop]);

  const rankChartData = useMemo(() => {
    if (filteredRanks.length === 0) return null;
    const ranks = filteredRanks.map((r) => r.rank);
    const minR = Math.min(...ranks) * 0.85;
    const maxR = Math.max(...ranks) * 1.15;
    const rangeR = maxR - minR || 1;

    let path = "";
    ranks.forEach((r, i) => {
      const x = padLeft + (i / Math.max(ranks.length - 1, 1)) * drawW;
      const y = padTop + ((r - minR) / rangeR) * drawH;
      if (i === 0) path += `M${x},${y}`;
      else path += ` L${x},${y}`;
    });

    return { path, minR, maxR };
  }, [filteredRanks, drawW, drawH, padLeft, padTop]);

  return (
    <CollapsiblePanel title="Charts" icon="trending-up">
      <View style={styles.controls}>
        <View style={styles.modeTabs}>
          <Pressable onPress={() => setMode("price")} style={[styles.modeTab, mode === "price" && styles.modeTabActive]}>
            <Text style={[styles.modeTabText, mode === "price" && styles.modeTabTextActive]}>Price</Text>
          </Pressable>
          <Pressable onPress={() => setMode("rank")} style={[styles.modeTab, mode === "rank" && styles.modeTabActive]}>
            <Text style={[styles.modeTabText, mode === "rank" && styles.modeTabTextActive]}>Sales Rank</Text>
          </Pressable>
        </View>
        <View style={styles.rangeTabs}>
          {(["30", "90", "180"] as TimeRange[]).map((r) => (
            <Pressable key={r} onPress={() => setRange(r)} style={[styles.rangeTab, range === r && styles.rangeTabActive]}>
              <Text style={[styles.rangeTabText, range === r && styles.rangeTabTextActive]}>{r}d</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.chartWrap}>
        {loading ? (
          <View style={[styles.loadingWrap, { width: chartWidth, height: chartHeight }]}>
            <ActivityIndicator size="small" color={Colors.light.accent} />
            <Text style={styles.loadingText}>Loading chart data...</Text>
          </View>
        ) : priceHistory.length === 0 && rankHistory.length === 0 ? (
          <View style={[styles.loadingWrap, { width: chartWidth, height: chartHeight }]}>
            <Text style={styles.loadingText}>No chart data available</Text>
          </View>
        ) : (
        <Svg width={chartWidth} height={chartHeight}>
          <Rect x={padLeft} y={padTop} width={drawW} height={drawH} fill="#FAFBFC" rx={2} />
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <Line key={f} x1={padLeft} y1={padTop + f * drawH} x2={padLeft + drawW} y2={padTop + f * drawH} stroke={Colors.light.border} strokeWidth={0.5} />
          ))}

          {mode === "price" && priceChartData && (
            <>
              <Path d={priceChartData.fbaPath} stroke={Colors.light.fba} strokeWidth={1.5} fill="none" opacity={0.6} />
              <Path d={priceChartData.amazonPath} stroke={Colors.light.amazon} strokeWidth={1.5} fill="none" opacity={0.7} />
              <Path d={priceChartData.buyBoxPath} stroke={Colors.light.accent} strokeWidth={2} fill="none" />
              <SvgText x={padLeft - 4} y={padTop + 8} textAnchor="end" fontSize={9} fill={Colors.light.textTertiary}>
                ${priceChartData.maxP.toFixed(0)}
              </SvgText>
              <SvgText x={padLeft - 4} y={padTop + drawH} textAnchor="end" fontSize={9} fill={Colors.light.textTertiary}>
                ${priceChartData.minP.toFixed(0)}
              </SvgText>
            </>
          )}

          {mode === "rank" && rankChartData && (
            <>
              <Path d={rankChartData.path} stroke={Colors.light.accent} strokeWidth={2} fill="none" />
              <SvgText x={padLeft - 4} y={padTop + 8} textAnchor="end" fontSize={8} fill={Colors.light.textTertiary}>
                {Math.round(rankChartData.minR).toLocaleString()}
              </SvgText>
              <SvgText x={padLeft - 4} y={padTop + drawH} textAnchor="end" fontSize={8} fill={Colors.light.textTertiary}>
                {Math.round(rankChartData.maxR).toLocaleString()}
              </SvgText>
            </>
          )}

          <SvgText x={padLeft} y={padTop + drawH + 14} fontSize={9} fill={Colors.light.textTertiary}>{rangeNum}d ago</SvgText>
          <SvgText x={padLeft + drawW} y={padTop + drawH + 14} textAnchor="end" fontSize={9} fill={Colors.light.textTertiary}>Today</SvgText>
        </Svg>
        )}
      </View>

      {mode === "price" && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: Colors.light.accent }]} />
            <Text style={styles.legendText}>Buy Box</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: Colors.light.amazon }]} />
            <Text style={styles.legendText}>Amazon</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendLine, { backgroundColor: Colors.light.fba }]} />
            <Text style={styles.legendText}>Lowest FBA</Text>
          </View>
        </View>
      )}
    </CollapsiblePanel>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: 6,
    padding: 2,
  },
  modeTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
  },
  modeTabActive: {
    backgroundColor: Colors.light.accent,
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.textTertiary,
  },
  modeTabTextActive: {
    color: "#FFFFFF",
  },
  rangeTabs: {
    flexDirection: "row",
    gap: 2,
  },
  rangeTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rangeTabActive: {
    backgroundColor: Colors.light.surfaceElevated,
  },
  rangeTabText: {
    fontSize: 10,
    color: Colors.light.textTertiary,
    fontWeight: "600" as const,
  },
  rangeTabTextActive: {
    color: Colors.light.text,
  },
  chartWrap: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    borderRadius: 6,
    overflow: "hidden",
  },
  loadingWrap: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFBFC",
    gap: 8,
  },
  loadingText: {
    fontSize: 11,
    color: Colors.light.textTertiary,
  },
  legend: {
    flexDirection: "row",
    gap: 14,
    marginTop: 8,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendLine: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
  },
  legendText: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
});
