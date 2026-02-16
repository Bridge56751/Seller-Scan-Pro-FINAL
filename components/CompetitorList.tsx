import { StyleSheet, Text, View, Platform } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import type { Competitor } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/mock-data";
import Colors from "@/constants/colors";

interface CompetitorListProps {
  competitors: Competitor[];
  buyBoxPrice: number;
  fbaSellerCount: number;
  fbmSellerCount: number;
}

function CompetitorRow({ competitor, buyBoxPrice }: { competitor: Competitor; buyBoxPrice: number }) {
  const totalPrice = competitor.price + competitor.shipping;
  const diff = totalPrice - buyBoxPrice;

  return (
    <View style={[styles.row, competitor.isBuyBox && styles.buyBoxRow]}>
      <View style={styles.rowLeft}>
        <View style={styles.sellerInfo}>
          <Text style={styles.sellerName} numberOfLines={1}>{competitor.name}</Text>
          <View style={styles.sellerTags}>
            {competitor.isFBA && (
              <View style={styles.fbaTag}>
                <Text style={styles.fbaTagText}>FBA</Text>
              </View>
            )}
            {!competitor.isFBA && (
              <View style={styles.fbmTag}>
                <Text style={styles.fbmTagText}>FBM</Text>
              </View>
            )}
            {competitor.isBuyBox && (
              <View style={styles.buyBoxTag}>
                <MaterialCommunityIcons name="crown" size={10} color="#F59E0B" />
                <Text style={styles.buyBoxTagText}>Buy Box</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.priceText}>{formatCurrency(competitor.price)}</Text>
        {competitor.shipping > 0 && (
          <Text style={styles.shippingText}>+{formatCurrency(competitor.shipping)}</Text>
        )}
        <Text style={styles.stockText}>{competitor.stockEstimate}+ in stock</Text>
      </View>
    </View>
  );
}

export function CompetitorList({ competitors, buyBoxPrice, fbaSellerCount, fbmSellerCount }: CompetitorListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Competition</Text>
        <View style={styles.counts}>
          <View style={styles.countBadge}>
            <Text style={styles.countNum}>{fbaSellerCount}</Text>
            <Text style={styles.countLabel}>FBA</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countNum}>{fbmSellerCount}</Text>
            <Text style={styles.countLabel}>FBM</Text>
          </View>
        </View>
      </View>

      <View style={styles.list}>
        {competitors.map((c, i) => (
          <CompetitorRow key={i} competitor={c} buyBoxPrice={buyBoxPrice} />
        ))}
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
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.dark.text,
  },
  counts: {
    flexDirection: "row",
    gap: 8,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.dark.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countNum: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.dark.text,
  },
  countLabel: {
    fontSize: 11,
    color: Colors.dark.textTertiary,
  },
  list: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.dark.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  buyBoxRow: {
    borderColor: "rgba(245, 158, 11, 0.3)",
    backgroundColor: "rgba(245, 158, 11, 0.06)",
  },
  rowLeft: {
    flex: 1,
    marginRight: 12,
  },
  sellerInfo: {
    gap: 4,
  },
  sellerName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.dark.text,
  },
  sellerTags: {
    flexDirection: "row",
    gap: 4,
  },
  fbaTag: {
    backgroundColor: Colors.dark.tintDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fbaTagText: {
    fontSize: 9,
    fontWeight: "700" as const,
    color: Colors.dark.tint,
  },
  fbmTag: {
    backgroundColor: Colors.dark.accentDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fbmTagText: {
    fontSize: 9,
    fontWeight: "700" as const,
    color: Colors.dark.accent,
  },
  buyBoxTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.dark.warningDim,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  buyBoxTagText: {
    fontSize: 9,
    fontWeight: "700" as const,
    color: "#F59E0B",
  },
  rowRight: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.dark.text,
  },
  shippingText: {
    fontSize: 10,
    color: Colors.dark.textTertiary,
  },
  stockText: {
    fontSize: 10,
    color: Colors.dark.textTertiary,
    marginTop: 2,
  },
});
