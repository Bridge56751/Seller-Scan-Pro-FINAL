import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { ProductData } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/mock-data";
import { CollapsiblePanel } from "./CollapsiblePanel";
import Colors from "@/constants/colors";

interface OffersPanelProps {
  product: ProductData;
  costPrice: number;
}


function AmazonSellerWarning({ product }: { product: ProductData }) {
  const isAmazonSeller = product.buyBoxSeller === "ATVPDKIKX0DER" || product.buyBoxSeller === "Amazon.com" || (product.amazonPrice !== null && product.amazonPrice > 0);

  if (!isAmazonSeller) return null;

  return (
    <View style={styles.amazonWarning}>
      <Feather name="alert-circle" size={14} color={Colors.light.yellow} />
      <Text style={styles.amazonWarningText}>Amazon sells this product directly</Text>
    </View>
  );
}

export function OffersPanel({ product, costPrice }: OffersPanelProps) {
  const totalSellers = product.competitorCount || (product.fbaSellerCount + product.fbmSellerCount);
  const hasDetailedOffers = product.competitors && product.competitors.length > 0;

  return (
    <CollapsiblePanel
      title="Offers"
      icon="users"
      badge={{ text: totalSellers + " sellers", color: Colors.light.textSecondary, bg: Colors.light.surfaceElevated }}
    >
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{totalSellers}</Text>
          <Text style={[styles.summaryLabel, { color: Colors.light.tint }]}>Total</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{product.newOfferCount}</Text>
          <Text style={[styles.summaryLabel, { color: Colors.light.profit }]}>New</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{product.usedOfferCount}</Text>
          <Text style={[styles.summaryLabel, { color: Colors.light.warning }]}>Used</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{formatCurrency(product.buyBoxPrice)}</Text>
          <Text style={[styles.summaryLabel, { color: Colors.light.buyBox }]}>Buy Box</Text>
        </View>
      </View>

      {product.buyBoxIsFBA !== undefined && (
        <View style={styles.buyBoxRow}>
          <View style={[styles.fulfillmentTag, { backgroundColor: product.buyBoxIsFBA ? "rgba(124, 58, 237, 0.08)" : "rgba(8, 145, 178, 0.08)" }]}>
            <Text style={[styles.fulfillmentText, { color: product.buyBoxIsFBA ? Colors.light.fba : Colors.light.fbm }]}>
              Buy Box: {product.buyBoxIsFBA ? "FBA" : "FBM"}
            </Text>
          </View>
          {product.buyBoxSeller && product.buyBoxSeller !== "Unknown" && (
            <Text style={styles.buyBoxSellerName} numberOfLines={1}>{product.buyBoxSeller}</Text>
          )}
        </View>
      )}

      <AmazonSellerWarning product={product} />
    </CollapsiblePanel>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  summaryNum: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "600" as const,
    marginTop: 2,
  },
  amazonWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.yellowBg,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  amazonWarningText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.yellow,
  },
  buyBoxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  buyBoxSellerName: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  fulfillmentTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  fulfillmentText: {
    fontSize: 9,
    fontWeight: "700" as const,
  },
});
