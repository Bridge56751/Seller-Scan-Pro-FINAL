import { StyleSheet, Text, View, FlatList, Pressable, Alert, Platform } from "react-native";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { getScanHistory, clearScanHistory, removeScanHistoryItem } from "@/lib/scan-history";
import { formatCurrency, formatBSR, type ScanHistoryItem } from "@/lib/mock-data";

function getTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

function HistoryRow({ item, onPress, onDelete }: { item: ScanHistoryItem; onPress: () => void; onDelete: () => void }) {
  const isProfitable = item.profit > 0;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onDelete(); }}
      style={({ pressed }) => [styles.historyRow, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.rowImageWrap}>
        <Image source={{ uri: item.imageUrl }} style={styles.rowImage} contentFit="contain" />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.rowMeta}>
          <Text style={styles.rowPrice}>{formatCurrency(item.price)}</Text>
          <View style={styles.rowBsr}>
            <Text style={styles.rowBsrText}>#{formatBSR(item.bsr)}</Text>
          </View>
          <Text style={styles.rowTime}>{getTimeAgo(item.timestamp)}</Text>
        </View>
      </View>
      <View style={styles.rowProfit}>
        <Text style={[styles.rowProfitVal, { color: isProfitable ? Colors.light.profit : Colors.light.loss }]}>
          {isProfitable ? "+" : ""}{formatCurrency(item.profit)}
        </Text>
        <Text style={[styles.rowRoi, { color: isProfitable ? Colors.light.profit : Colors.light.loss }]}>
          {item.roi.toFixed(0)}%
        </Text>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useFocusEffect(useCallback(() => {
    getScanHistory().then((data) => { setHistory(data); setLoading(false); });
  }, []));

  const handleClear = useCallback(() => {
    Alert.alert("Clear History", "Remove all scan history?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: async () => {
        await clearScanHistory(); setHistory([]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }},
    ]);
  }, []);

  const handleDelete = useCallback(async (asin: string) => {
    await removeScanHistoryItem(asin);
    setHistory((prev) => prev.filter((h) => h.asin !== asin));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerCount}>{history.length} items</Text>
        {history.length > 0 && (
          <Pressable onPress={handleClear} style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}>
            <Feather name="trash-2" size={16} color={Colors.light.danger} />
          </Pressable>
        )}
      </View>

      {history.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Feather name="clock" size={32} color={Colors.light.textTertiary} />
          <Text style={styles.emptyTitle}>No History</Text>
          <Text style={styles.emptyText}>Products you scan or search will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryRow
              item={item}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: "/product/[asin]", params: { asin: item.asin } });
              }}
              onDelete={() => handleDelete(item.asin)}
            />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 100 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={history.length > 0}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  headerCount: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    flex: 1,
  },
  clearBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.light.dangerDim,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 12,
    gap: 6,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 10,
  },
  rowImageWrap: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  rowImage: {
    width: 36,
    height: 36,
  },
  rowContent: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowPrice: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  rowBsr: {
    backgroundColor: Colors.light.accentDim,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  rowBsrText: {
    fontSize: 9,
    fontWeight: "600" as const,
    color: Colors.light.accent,
  },
  rowTime: {
    fontSize: 10,
    color: Colors.light.textTertiary,
  },
  rowProfit: {
    alignItems: "flex-end",
  },
  rowProfitVal: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  rowRoi: {
    fontSize: 10,
    fontWeight: "600" as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.light.textTertiary,
    textAlign: "center",
  },
});
