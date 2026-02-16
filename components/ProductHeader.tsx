import { StyleSheet, Text, View, Platform } from "react-native";
import { Image } from "expo-image";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import type { ProductData } from "@/lib/mock-data";
import { formatBSR, formatCurrency, estimateSalesPerDay } from "@/lib/mock-data";
import Colors from "@/constants/colors";

interface ProductHeaderProps {
  product: ProductData;
}

export function ProductHeader({ product }: ProductHeaderProps) {
  const salesPerDay = estimateSalesPerDay(product.categoryRank, product.category);
  const salesPerMonth = salesPerDay * 30;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="contain" />
        </View>
        <View style={styles.info}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.title} numberOfLines={3}>{product.title}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount.toLocaleString()})</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Buy Box</Text>
          <Text style={styles.statValue}>{formatCurrency(product.buyBoxPrice)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>BSR</Text>
          <Text style={[styles.statValue, { color: Colors.dark.accent }]}>#{formatBSR(product.categoryRank)}</Text>
          <Text style={styles.statSub}>{product.category}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Est. Sales</Text>
          <Text style={[styles.statValue, { color: Colors.dark.tint }]}>{salesPerMonth.toLocaleString()}</Text>
          <Text style={styles.statSub}>/month</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailChip}>
          <Text style={styles.detailLabel}>ASIN</Text>
          <Text style={styles.detailValue}>{product.asin}</Text>
        </View>
        <View style={styles.detailChip}>
          <Text style={styles.detailLabel}>Weight</Text>
          <Text style={styles.detailValue}>{product.weight} lbs</Text>
        </View>
        <View style={styles.detailChip}>
          <Text style={styles.detailLabel}>Size</Text>
          <Text style={styles.detailValue}>{product.isOversized ? "Oversized" : "Standard"}</Text>
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
  topRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  imageWrap: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: 80,
    height: 80,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  brand: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.dark.tint,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.dark.text,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.dark.textTertiary,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.dark.border,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.dark.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.dark.text,
  },
  statSub: {
    fontSize: 10,
    color: Colors.dark.textTertiary,
    marginTop: 1,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 8,
  },
  detailChip: {
    flex: 1,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 9,
    color: Colors.dark.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.dark.textSecondary,
  },
});
