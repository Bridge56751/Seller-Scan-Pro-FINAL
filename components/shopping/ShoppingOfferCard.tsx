import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { ShoppingOffer } from "@/shared/shopping";
import Colors from "@/constants/colors";

type Props = {
  offer: ShoppingOffer;
  cheapest: boolean;
  onOpen: (url: string) => void;
};

// Image-left marketplace rows keep the product, real price and destination together.
export default function ShoppingOfferCard({ offer, cheapest, onOpen }: Props) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imageUrl = offer.imageUrl;
  const showImage = !!imageUrl && failedImage !== imageUrl;

  return <View style={[styles.card, cheapest && styles.cheapestCard]}>
    <View style={styles.picture}>
      {showImage ? <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="contain"
        accessibilityLabel={offer.title}
        onError={() => setFailedImage(imageUrl)}
      /> : <View style={styles.placeholder}>
        <Feather name="image" size={24} color={Colors.light.textTertiary} />
        <Text style={styles.placeholderText}>No image</Text>
      </View>}
    </View>
    <View style={styles.details}>
      <View style={styles.badges}>
        <View style={styles.sellerBadge}>
          <Text numberOfLines={1} style={styles.seller}>{offer.seller || "Marketplace"}</Text>
        </View>
        {cheapest && <Text style={styles.lowest}>Lowest listed price</Text>}
      </View>
      <Text numberOfLines={3} style={styles.title}>{offer.title}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{offer.priceText?.trim() || "Price unavailable"}</Text>
        {!!offer.currency && <Text style={styles.currency}>{offer.currency}</Text>}
      </View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={offer.linkKind === "comparison" ? `View Google Shopping offers for ${offer.title}` : `View listing at ${offer.seller || "marketplace"}`}
        onPress={() => onOpen(offer.url)}
        style={({ pressed }) => [styles.link, pressed && styles.pressed]}
      >
        <Text style={styles.linkText}>{offer.linkKind === "comparison" ? "View Offers on Google" : "View Listing"}</Text>
        <Feather name="external-link" size={13} color={Colors.light.accent} />
      </Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", padding: 12, gap: 12, borderWidth: 1, borderColor: Colors.light.border, backgroundColor: Colors.light.surface, borderRadius: 12 },
  cheapestCard: { borderColor: Colors.light.accent },
  picture: { width: 88, minHeight: 116, borderRadius: 7, backgroundColor: Colors.light.surfaceElevated, overflow: "hidden", alignSelf: "stretch", justifyContent: "center" },
  image: { width: "100%", height: 128 },
  placeholder: { flex: 1, minHeight: 116, alignItems: "center", justifyContent: "center", gap: 7 },
  placeholderText: { fontSize: 11, color: Colors.light.textSecondary },
  details: { flex: 1, minWidth: 0, gap: 5 },
  badges: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  sellerBadge: { backgroundColor: Colors.light.accentDim, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3, maxWidth: "100%" },
  seller: { fontSize: 11, fontWeight: "700", color: Colors.light.accent },
  lowest: { color: Colors.light.accent, fontSize: 10, fontWeight: "700" },
  title: { fontSize: 14, fontWeight: "500", lineHeight: 19, color: Colors.light.text },
  priceRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", gap: 5 },
  price: { fontSize: 22, fontWeight: "700", color: Colors.light.text, letterSpacing: -0.5 },
  currency: { fontSize: 11, color: Colors.light.textSecondary, fontWeight: "600" },
  condition: { fontSize: 11, color: Colors.light.textSecondary, textTransform: "capitalize" },
  warning: { fontSize: 11, lineHeight: 16, color: Colors.light.warning },
  link: { marginTop: 3, borderRadius: 5, backgroundColor: Colors.light.accentDim, minHeight: 38, paddingHorizontal: 8, paddingVertical: 9, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7 },
  linkText: { fontSize: 12, fontWeight: "600", color: Colors.light.accent },
  pressed: { opacity: 0.65 },
});
