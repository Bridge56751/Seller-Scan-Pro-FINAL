import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ProductData, Competitor } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/mock-data";
import { CollapsiblePanel } from "./CollapsiblePanel";
import Colors from "@/constants/colors";

interface OffersPanelProps {
  product: ProductData;
  costPrice: number;
}

function OfferRow({ seller, product, costPrice, isLast }: { seller: Competitor; product: ProductData; costPrice: number; isLast: boolean }) {
  const totalPrice = seller.price + seller.shipping;
  const profitAtThisPrice = costPrice > 0 ? totalPrice - costPrice - product.totalFees : 0;
  const roiAtThisPrice = costPrice > 0 ? (profitAtThisPrice / costPrice) * 100 : 0;
  const isProfitable = profitAtThisPrice > 0 && costPrice > 0;

  return (
    <View style={[styles.offerRow, !isLast && styles.offerRowBorder]}>
      <View style={styles.offerLeft}>
        <View style={styles.sellerNameRow}>
          <Text style={styles.sellerName} numberOfLines={1}>{seller.name}</Text>
          {seller.isBuyBox && (
            <View style={styles.buyBoxBadge}>
              <MaterialCommunityIcons name="crown" size={9} color={Colors.light.buyBox} />
            </View>
          )}
        </View>
        <View style={styles.sellerTags}>
          <View style={[styles.fulfillmentTag, { backgroundColor: seller.isFBA ? "rgba(124, 58, 237, 0.08)" : "rgba(8, 145, 178, 0.08)" }]}>
            <Text style={[styles.fulfillmentText, { color: seller.isFBA ? Colors.light.fba : Colors.light.fbm }]}>
              {seller.isFBA ? "FBA" : "FBM"}
            </Text>
          </View>
          <Text style={styles.stockText}>{seller.stockEstimate}+ in stock</Text>
          <Text style={styles.ratingSmall}>{seller.rating}★</Text>
        </View>
      </View>
      <View style={styles.offerRight}>
        <Text style={styles.offerPrice}>{formatCurrency(seller.price)}</Text>
        {seller.shipping > 0 && (
          <Text style={styles.shippingText}>+{formatCurrency(seller.shipping)} ship</Text>
        )}
        {costPrice > 0 && (
          <Text style={[styles.profitAtPrice, { color: isProfitable ? Colors.light.profit : Colors.light.loss }]}>
            {isProfitable ? "+" : ""}{formatCurrency(profitAtThisPrice)} ({roiAtThisPrice.toFixed(0)}%)
          </Text>
        )}
      </View>
    </View>
  );
}

function MarketShareBar({ product }: { product: ProductData }) {
  const isAmazonSeller = product.buyBoxSeller === "ATVPDKIKX0DER" || product.buyBoxSeller === "Amazon.com";
  const totalSellers = product.competitorCount || (product.fbaSellerCount + product.fbmSellerCount);
  const amazonCount = isAmazonSeller ? 1 : 0;
  const thirdPartyCount = Math.max(0, totalSellers - amazonCount);

  if (totalSellers <= 0) return null;

  const amazonPct = Math.round((amazonCount / totalSellers) * 100);
  const thirdPartyPct = 100 - amazonPct;

  return (
    <View style={styles.marketShare}>
      <Text style={styles.marketShareTitle}>Market Share</Text>
      <View style={styles.marketBar}>
        {amazonPct > 0 && (
          <View style={[styles.marketSegment, { flex: amazonPct, backgroundColor: Colors.light.amazon, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, borderTopRightRadius: thirdPartyPct === 0 ? 4 : 0, borderBottomRightRadius: thirdPartyPct === 0 ? 4 : 0 }]} />
        )}
        {thirdPartyPct > 0 && (
          <View style={[styles.marketSegment, { flex: thirdPartyPct, backgroundColor: Colors.light.accent, borderTopRightRadius: 4, borderBottomRightRadius: 4, borderTopLeftRadius: amazonPct === 0 ? 4 : 0, borderBottomLeftRadius: amazonPct === 0 ? 4 : 0 }]} />
        )}
      </View>
      <View style={styles.marketLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.light.amazon }]} />
          <Text style={styles.legendText}>Amazon {amazonPct}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.light.accent }]} />
          <Text style={styles.legendText}>3rd Party {thirdPartyPct}%</Text>
        </View>
      </View>
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

      <MarketShareBar product={product} />

      {hasDetailedOffers && (
        <View style={styles.offersList}>
          <View style={styles.offersHeader}>
            <Text style={styles.offersHeaderText}>Seller</Text>
            <Text style={styles.offersHeaderText}>Price {costPrice > 0 ? "/ Your Profit" : ""}</Text>
          </View>
          {product.competitors.map((seller, i) => (
            <OfferRow
              key={i}
              seller={seller}
              product={product}
              costPrice={costPrice}
              isLast={i === product.competitors.length - 1}
            />
          ))}
        </View>
      )}
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
  marketShare: {
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  marketShareTitle: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  marketBar: {
    flexDirection: "row",
    height: 10,
    borderRadius: 4,
    overflow: "hidden",
    gap: 1,
  },
  marketSegment: {
    height: 10,
  },
  marketLegend: {
    flexDirection: "row",
    gap: 14,
    marginTop: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
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
  offersList: {},
  offersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    marginBottom: 2,
  },
  offersHeaderText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.light.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
  },
  offerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  offerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  offerLeft: {
    flex: 1,
    marginRight: 12,
  },
  sellerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sellerName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
    flexShrink: 1,
  },
  buyBoxBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  sellerTags: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
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
  stockText: {
    fontSize: 10,
    color: Colors.light.textTertiary,
  },
  ratingSmall: {
    fontSize: 10,
    color: Colors.light.textTertiary,
  },
  offerRight: {
    alignItems: "flex-end",
  },
  offerPrice: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  shippingText: {
    fontSize: 10,
    color: Colors.light.textTertiary,
  },
  profitAtPrice: {
    fontSize: 10,
    fontWeight: "600" as const,
    marginTop: 2,
  },
});
