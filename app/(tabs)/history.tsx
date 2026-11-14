import { StyleSheet, Text, View, FlatList, Pressable, Alert, Platform, Image } from "react-native";
import { useState, useCallback, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Feather, FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { photoScanHistory, type PhotoScanHistoryItem } from "@/lib/photo-scan-history";
import { useScanSession } from "@/lib/scan-session";

function getTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

function savedPrice(item: PhotoScanHistoryItem): string | null {
  const result = item.result;
  if (!result) return null;
  const amounts = result.offers
    .filter(offer => offer.titleMatches && !offer.restricted && offer.currency === result.currency
      && typeof offer.amount === "number" && Number.isFinite(offer.amount) && offer.amount >= 0)
    .map(offer => offer.amount as number);
  if (!amounts.length) return null;
  const amount = Math.min(...amounts);
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: result.currency }).format(amount);
  } catch {
    return `${result.currency} ${amount.toFixed(2)}`;
  }
}

function confirmRemoval(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Remove", style: "destructive", onPress: onConfirm },
  ]);
}

function HistoryRow({ item, onPress, onDelete, busy, deleting }: {
  item: PhotoScanHistoryItem; onPress: () => void; onDelete: () => void; busy: boolean; deleting: boolean;
}) {
  const title = item.query.trim() || item.matches[0]?.title?.trim() || "Unidentified product";
  const price = savedPrice(item);
  const [imageFailed, setImageFailed] = useState(false);
  const count = item.result?.offers.length ?? 0;
  const isBarcode = item.source === "barcode" || !!item.barcode;
  const imageUri = isBarcode ? item.productImageUrl && /^https:\/\//i.test(item.productImageUrl) ? item.productImageUrl : null : item.photoUri;
  return (
    <View style={styles.historyRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open saved ${isBarcode ? "barcode" : "photo"} scan: ${title}`}
        accessibilityHint={busy ? "Wait for your current scan to finish" : "View saved results without searching again"}
        disabled={busy || deleting}
        onPress={onPress}
        style={({ pressed }) => [styles.rowOpen, (busy || deleting) && { opacity: 0.55 }, pressed && { opacity: 0.9 }]}
      >
      <View style={styles.rowImageWrap}>
        {imageUri && !imageFailed ? (
          <Image source={{ uri: imageUri }} style={styles.rowImage} resizeMode="cover" onError={() => setImageFailed(true)} />
        ) : isBarcode ? <FontAwesome name="barcode" size={24} color={Colors.light.textTertiary} /> : <Feather name="camera" size={24} color={Colors.light.textTertiary} />}
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.rowMeta}>
          {isBarcode ? <FontAwesome name="barcode" size={12} color={Colors.light.accent} accessibilityLabel="Barcode scan" /> : <Feather name="camera" size={12} color={Colors.light.textTertiary} accessibilityLabel="Photo scan" />}
          <Text style={styles.rowTime}>{count} {count === 1 ? "listing" : "listings"}</Text>
          <Text style={styles.rowTime} accessibilityLabel={new Date(item.timestamp).toLocaleString()}>{getTimeAgo(item.timestamp)}</Text>
        </View>
        {item.error ? <Text style={styles.rowError} numberOfLines={1}>Scan incomplete · Open for details</Text> : null}
      </View>
      {price ? <View style={styles.rowSnapshot}>
        <Text style={styles.rowPrice}>{price}</Text>
        <Text style={styles.rowTime}>Saved lowest</Text>
      </View> : null}
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Delete saved scan: ${title}`}
        disabled={deleting} onPress={onDelete}
        hitSlop={6} style={({ pressed }) => [styles.deleteBtn, (pressed || deleting) && { opacity: 0.45 }]}>
        <Feather name="trash-2" size={16} color={Colors.light.danger} />
      </Pressable>
    </View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { restore, busy, historyVersion } = useScanSession();
  const [history, setHistory] = useState<PhotoScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const active = useRef(false);
  const request = useRef(0);
  const mutationLock = useRef(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const load = useCallback(async () => {
    const version = ++request.current;
    setLoading(true);
    setError(null);
    try {
      const data = await photoScanHistory.list();
      if (active.current && version === request.current) setHistory(data);
    } catch {
      if (active.current && version === request.current) setError("Saved scans could not be loaded. Please try again.");
    } finally {
      if (active.current && version === request.current) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    active.current = true;
    if (!mutationLock.current) { setDeleting(null); setClearing(false); }
    void load();
    return () => { active.current = false; request.current += 1; };
  }, [load, historyVersion]));

  const remove = useCallback(async (id?: string) => {
    if (mutationLock.current) return;
    mutationLock.current = true;
    ++request.current;
    setLoading(false);
    setError(null);
    if (id) setDeleting(id); else setClearing(true);
    try {
      if (id) await photoScanHistory.remove(id);
      else await photoScanHistory.clear();
      if (active.current) {
        setHistory(previous => id ? previous.filter(item => item.id !== id) : []);
        if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } catch {
      if (active.current) setError("Could not remove saved scans from this device. Nothing has been deleted. Please try again.");
    } finally {
      mutationLock.current = false;
      if (active.current) { setDeleting(null); setClearing(false); }
    }
  }, []);

  const handleClear = useCallback(() => {
    confirmRemoval("Clear History", "Remove all saved scans and their photos from this device? This cannot be undone.", () => { void remove(); });
  }, [remove]);

  const handleDelete = useCallback((id: string) => {
    confirmRemoval("Delete saved scan?", "Remove this scan and its photo from this device?", () => { void remove(id); });
  }, [remove]);

  return (
    <View style={styles.container}>
      <View style={[styles.topFill, { height: insets.top + webTopInset }]} />
      <Text style={styles.brandTitle}>Seller Scan</Text>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <Text style={styles.headerCount}>{history.length} scans</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear all saved scans"
          disabled={history.length === 0 || clearing || deleting !== null}
          onPress={handleClear}
          style={({ pressed }) => [styles.clearBtn, history.length === 0 && { opacity: 0.35 }, pressed && history.length > 0 && { opacity: 0.7 }]}
        >
          <Feather name="trash-2" size={16} color={Colors.light.danger} />
        </Pressable>
      </View>
      <Text style={styles.historyNote}>Your latest 50 scans are saved on this device. Prices are saved snapshots, not live offers.</Text>
      {busy ? <Text style={styles.historyNote}>A scan is in progress. You can open saved results when it finishes.</Text> : null}
      {error ? <View style={styles.errorBanner}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={() => { void load(); }} disabled={clearing || deleting !== null} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View> : null}

      {loading ? (
        <View style={styles.list} accessibilityLabel="Loading saved scans" accessibilityRole="progressbar">
          {[0, 1, 2, 3].map(key => <View key={key} style={styles.historyRow}>
            <View style={[styles.rowImageWrap, styles.skeleton]} />
            <View style={styles.rowContent}><View style={[styles.skeleton, { height: 12, width: "72%" }]} /><View style={[styles.skeleton, { height: 10, width: "44%", marginTop: 5 }]} /></View>
          </View>)}
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="clock" size={32} color={Colors.light.textTertiary} />
          <Text style={styles.emptyTitle}>{error ? "History unavailable" : "No saved scans yet"}</Text>
          <Text style={styles.emptyText}>{error ? "Retry above to load the scans saved on this device." : "Photograph a product or scan its barcode to find places to buy it for less. Your saved scans will appear here."}</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryRow
              item={item}
              busy={busy}
              deleting={clearing || deleting !== null}
              onPress={() => {
                if (busy || !restore(item)) return;
                if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                router.push("/scan-results");
              }}
              onDelete={() => handleDelete(item.id)}
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
  topFill: {
    backgroundColor: Colors.light.accent,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Colors.light.accent,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 14,
    paddingTop: 4,
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
  rowOpen: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  deleteBtn: {
    width: 32,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  historyNote: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.light.textTertiary,
  },
  errorBanner: {
    marginHorizontal: 12,
    marginTop: 8,
    padding: 10,
    borderRadius: 6,
    backgroundColor: Colors.light.dangerDim,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: Colors.light.danger,
  },
  retryBtn: {
    padding: 8,
  },
  retryText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.accent,
  },
  skeleton: {
    backgroundColor: Colors.light.borderLight,
    borderRadius: 5,
  },
  rowError: {
    fontSize: 10,
    color: Colors.light.danger,
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
    flexWrap: "wrap",
  },
  rowPrice: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  rowTime: {
    fontSize: 10,
    color: Colors.light.textTertiary,
  },
  rowSnapshot: {
    alignItems: "flex-end",
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
