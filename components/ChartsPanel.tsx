import { StyleSheet, Text, View, Pressable, ActivityIndicator, PanResponder } from "react-native";
import { useState, useMemo, useRef, useCallback } from "react";
import Svg, { Path, Line, Text as SvgText, Rect, Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
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

interface ScrubData {
  x: number;
  index: number;
}

export function ChartsPanel({ priceHistory, rankHistory, loading }: ChartsPanelProps) {
  const [mode, setMode] = useState<ChartMode>("price");
  const [range, setRange] = useState<TimeRange>("90");
  const [scrub, setScrub] = useState<ScrubData | null>(null);
  const lastIndexRef = useRef(-1);

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

  const activeData = mode === "price" ? filteredPrices : filteredRanks;
  const dataLen = activeData.length;

  const localXToIndex = useCallback((localX: number) => {
    const clampedX = Math.max(padLeft, Math.min(localX, padLeft + drawW));
    const ratio = (clampedX - padLeft) / drawW;
    const idx = Math.round(ratio * Math.max(dataLen - 1, 0));
    return { x: clampedX, index: Math.max(0, Math.min(idx, dataLen - 1)) };
  }, [dataLen, padLeft, drawW]);

  const chartViewRef = useRef<View>(null);
  const isScrubbing = useRef(false);
  const grantLocationX = useRef(0);
  const grantPageX = useRef(0);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => dataLen > 0,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      if (dataLen === 0) return false;
      if (isScrubbing.current) return true;
      const dx = Math.abs(gestureState.dx);
      const dy = Math.abs(gestureState.dy);
      return dx > 8 && dx > dy * 1.2;
    },
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: (_, gestureState) => {
      if (dataLen === 0) return false;
      if (isScrubbing.current) return true;
      const dx = Math.abs(gestureState.dx);
      const dy = Math.abs(gestureState.dy);
      return dx > 8 && dx > dy * 1.2;
    },
    onPanResponderGrant: (evt) => {
      isScrubbing.current = true;
      grantLocationX.current = evt.nativeEvent.locationX;
      grantPageX.current = evt.nativeEvent.pageX;
      const result = localXToIndex(evt.nativeEvent.locationX);
      lastIndexRef.current = result.index;
      setScrub(result);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onPanResponderMove: (evt) => {
      const localX = evt.nativeEvent.locationX != null
        ? evt.nativeEvent.locationX
        : grantLocationX.current + (evt.nativeEvent.pageX - grantPageX.current);
      const { x, index } = localXToIndex(localX);
      if (index !== lastIndexRef.current) {
        lastIndexRef.current = index;
        Haptics.selectionAsync();
      }
      setScrub({ x, index });
    },
    onPanResponderRelease: () => {
      isScrubbing.current = false;
      setScrub(null);
      lastIndexRef.current = -1;
    },
    onPanResponderTerminate: () => {
      isScrubbing.current = false;
      setScrub(null);
      lastIndexRef.current = -1;
    },
    onPanResponderTerminationRequest: () => !isScrubbing.current,
  }), [dataLen, localXToIndex]);

  const scrubInfo = useMemo(() => {
    if (!scrub || dataLen === 0) return null;
    const idx = scrub.index;

    if (mode === "price" && filteredPrices[idx]) {
      const p = filteredPrices[idx];
      return {
        date: p.date,
        primary: `$${p.buyBox.toFixed(2)}`,
        primaryLabel: "Buy Box",
        secondary: p.amazon !== null ? `$${p.amazon.toFixed(2)}` : null,
        secondaryLabel: "Amazon",
        tertiary: p.newPrice > 0 ? `$${p.newPrice.toFixed(2)}` : null,
        tertiaryLabel: "FBA",
      };
    }
    if (mode === "rank" && filteredRanks[idx]) {
      const r = filteredRanks[idx];
      return {
        date: r.date,
        primary: r.rank >= 1000 ? (r.rank / 1000).toFixed(1) + "K" : r.rank.toString(),
        primaryLabel: "BSR",
        secondary: null,
        secondaryLabel: "",
        tertiary: null,
        tertiaryLabel: "",
      };
    }
    return null;
  }, [scrub, mode, filteredPrices, filteredRanks, dataLen]);

  const priceChartData = useMemo(() => {
    if (filteredPrices.length === 0) return null;
    const buyBoxPrices = filteredPrices.map((p) => p.buyBox);
    const amazonPrices = filteredPrices.map((p) => p.amazon).filter((p): p is number => p !== null);
    const newPrices = filteredPrices.map((p) => p.newPrice);
    const allPrices = [...buyBoxPrices, ...amazonPrices, ...newPrices].filter(v => v > 0);
    if (allPrices.length === 0) return null;
    const minP = Math.min(...allPrices) * 0.97;
    const maxP = Math.max(...allPrices) * 1.03;
    const rangeP = maxP - minP || 1;

    const toPath = (prices: (number | null)[]) => {
      let path = "";
      let started = false;
      prices.forEach((p, i) => {
        if (p === null || p <= 0) return;
        const x = padLeft + (i / Math.max(prices.length - 1, 1)) * drawW;
        const y = padTop + (1 - (p - minP) / rangeP) * drawH;
        if (!started) { path += `M${x},${y}`; started = true; }
        else path += ` L${x},${y}`;
      });
      return path;
    };

    const getYForIndex = (idx: number) => {
      const p = filteredPrices[idx];
      if (!p || p.buyBox <= 0) return padTop + drawH / 2;
      return padTop + (1 - (p.buyBox - minP) / rangeP) * drawH;
    };

    return {
      buyBoxPath: toPath(buyBoxPrices),
      amazonPath: toPath(filteredPrices.map((p) => p.amazon)),
      fbaPath: toPath(newPrices),
      minP, maxP, getYForIndex,
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

    const getYForIndex = (idx: number) => {
      const r = filteredRanks[idx];
      if (!r) return padTop + drawH / 2;
      return padTop + ((r.rank - minR) / rangeR) * drawH;
    };

    return { path, minR, maxR, getYForIndex };
  }, [filteredRanks, drawW, drawH, padLeft, padTop]);

  const scrubDotY = useMemo(() => {
    if (!scrub) return 0;
    if (mode === "price" && priceChartData) {
      return priceChartData.getYForIndex(scrub.index);
    }
    if (mode === "rank" && rankChartData) {
      return rankChartData.getYForIndex(scrub.index);
    }
    return padTop + drawH / 2;
  }, [scrub, mode, priceChartData, rankChartData, padTop, drawH]);

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const m = parseInt(parts[1]) - 1;
      return `${months[m]} ${parseInt(parts[2])}`;
    }
    return dateStr;
  };

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

      {scrub && scrubInfo && (
        <View style={styles.scrubTooltip}>
          <Text style={styles.scrubDate}>{formatDate(scrubInfo.date)}</Text>
          <View style={styles.scrubValues}>
            <Text style={[styles.scrubValue, { color: mode === "price" ? Colors.light.accent : Colors.light.accent }]}>
              {scrubInfo.primaryLabel}: {scrubInfo.primary}
            </Text>
            {scrubInfo.secondary && (
              <Text style={[styles.scrubValue, { color: Colors.light.amazon }]}>
                {scrubInfo.secondaryLabel}: {scrubInfo.secondary}
              </Text>
            )}
            {scrubInfo.tertiary && (
              <Text style={[styles.scrubValue, { color: Colors.light.fba }]}>
                {scrubInfo.tertiaryLabel}: {scrubInfo.tertiary}
              </Text>
            )}
          </View>
        </View>
      )}

      <View
        ref={chartViewRef}
        style={styles.chartWrap}
        {...panResponder.panHandlers}
      >
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

            {scrub && (
              <>
                <Line
                  x1={scrub.x}
                  y1={padTop}
                  x2={scrub.x}
                  y2={padTop + drawH}
                  stroke={Colors.light.text}
                  strokeWidth={1}
                  strokeDasharray="3,2"
                  opacity={0.5}
                />
                <Circle
                  cx={scrub.x}
                  cy={scrubDotY}
                  r={4}
                  fill={Colors.light.accent}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              </>
            )}

            {!scrub && (
              <>
                <SvgText x={padLeft} y={padTop + drawH + 14} fontSize={9} fill={Colors.light.textTertiary}>{rangeNum}d ago</SvgText>
                <SvgText x={padLeft + drawW} y={padTop + drawH + 14} textAnchor="end" fontSize={9} fill={Colors.light.textTertiary}>Today</SvgText>
              </>
            )}
            {scrub && scrubInfo && (
              <SvgText x={scrub.x} y={padTop + drawH + 14} textAnchor="middle" fontSize={9} fontWeight="600" fill={Colors.light.text}>
                {formatDate(scrubInfo.date)}
              </SvgText>
            )}
          </Svg>
        )}
      </View>

      {mode === "price" && !scrub && (
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
  scrubTooltip: {
    backgroundColor: Colors.light.text,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    alignSelf: "center",
  },
  scrubDate: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 2,
  },
  scrubValues: {
    flexDirection: "row",
    gap: 10,
  },
  scrubValue: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
});
