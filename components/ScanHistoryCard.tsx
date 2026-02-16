import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import type { ScanHistoryItem } from "@/lib/mock-data";
import { formatCurrency, formatBSR } from "@/lib/mock-data";
import Colors from "@/constants/colors";
import * as Haptics from "expo-haptics";

interface ScanHistoryCardProps {
  item: ScanHistoryItem;
  onPress: () => void;
  onDelete: () => void;
}

export function ScanHistoryCard({ item, onPress, onDelete }: ScanHistoryCardProps) {
  const isProfitable = item.profit > 0;
  const profitColor = isProfitable ? Colors.dark.profit : Colors.dark.loss;
  const timeAgo = getTimeAgo(item.timestamp);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onDelete();
      }}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="contain" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          <View style={styles.bsrChip}>
            <Text style={styles.bsrText}>BSR #{formatBSR(item.bsr)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.profitCol}>
        <Text style={[styles.profitValue, { color: profitColor }]}>
          {isProfitable ? "+" : ""}{formatCurrency(item.profit)}
        </Text>
        <Text style={[styles.roiText, { color: profitColor }]}>
          {item.roi.toFixed(0)}% ROI
        </Text>
        <Text style={styles.timeText}>{timeAgo}</Text>
      </View>
    </Pressable>
  );
}

function getTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  imageWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: 44,
    height: 44,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.dark.text,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.dark.text,
  },
  bsrChip: {
    backgroundColor: Colors.dark.accentDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bsrText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.dark.accent,
  },
  profitCol: {
    alignItems: "flex-end",
    gap: 2,
  },
  profitValue: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  roiText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  timeText: {
    fontSize: 10,
    color: Colors.dark.textTertiary,
    marginTop: 2,
  },
});
