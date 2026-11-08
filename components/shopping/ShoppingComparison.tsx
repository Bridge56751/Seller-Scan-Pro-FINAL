import { useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { comparisonSchema, countryInfo, type Comparison } from "@/shared/shopping";
import { compareProduct } from "@/lib/shopping-client";
import Colors from "@/constants/colors";
import { shoppingStyles as styles } from "./styles";
import ShoppingOfferCard from "./ShoppingOfferCard";
import PriceSortControl from "./PriceSortControl";
import { sortOffersByPrice, type PriceSort } from "@/shared/offer-sorting";

export default function ShoppingComparison({ country, initialProduct = "", onBusyChange }: {
  country: string; initialProduct?: string; onBusyChange?: (value: boolean) => void;
}) {
  const [product, setProduct] = useState(initialProduct);
  const [size, setSize] = useState(initialProduct ? "N/A" : "");
  const [color, setColor] = useState(initialProduct ? "N/A" : "");
  const [editing, setEditing] = useState(!initialProduct);
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState<"new" | "used">("new");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Comparison | null>(null);
  const [editingResult, setEditingResult] = useState(false);
  const [priceSort, setPriceSort] = useState<PriceSort>("low");
  const lock = useRef(false);
  const parsed = comparisonSchema.safeParse({ product, size, color, quantity: Number(quantity), condition, country, confirmed });
  function changed() { setConfirmed(false); setResult(null); setError(null); }
  async function compare() {
    if (!parsed.success || lock.current || !countryInfo(country)) return;
    lock.current = true; setBusy(true); onBusyChange?.(true); setError(null);
    try { setResult(await compareProduct(parsed.data)); setEditingResult(false); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not compare prices. Please try again."); }
    finally { lock.current = false; setBusy(false); onBusyChange?.(false); }
  }
  async function openOffer(url: string) {
    try { await Linking.openURL(url); }
    catch { setError("Could not open this listing. Please try again."); }
  }
  const fields = [
    ["Brand and exact model", product, setProduct, "e.g. Sony WH-1000XM5"],
    ["Size / capacity / edition", size, setSize, "Enter the variant, or N/A"],
    ["Color", color, setColor, "Enter the color, or N/A"],
    ["Pack quantity", quantity, setQuantity, "1"],
  ] as const;
  const visibleOffers = sortOffersByPrice(result?.offers.filter(offer => offer.titleMatches) ?? [], result?.currency, priceSort);
  const isRanked = (offer: Comparison["offers"][number]) =>
    offer.titleMatches && !offer.restricted && offer.currency === result?.currency &&
    offer.amount !== null && Number.isFinite(offer.amount);
  const rankedOffers = visibleOffers.filter(isRanked);
  const cheapestOffer = rankedOffers.reduce<Comparison["offers"][number] | undefined>(
    (lowest, offer) => !lowest || offer.amount! < lowest.amount! ? offer : lowest, undefined);
  const showForm = !result || editingResult;
  return <View style={styles.section}>
    {result && !editingResult && <View style={resultStyles.summary}>
      <View style={resultStyles.summaryCopy}>
        <Text style={resultStyles.eyebrow}>YOUR PRODUCT</Text>
        <Text numberOfLines={2} style={styles.label}>{product}</Text>
        <Text style={resultStyles.meta}>{[size !== "N/A" && size, color !== "N/A" && color, `Qty ${quantity}`, condition === "new" ? "New" : "Used"].filter(Boolean).join(" · ")}</Text>
      </View>
      <View style={resultStyles.controls}>
        <Pressable accessibilityRole="button" disabled={busy} onPress={() => { setEditing(true); setEditingResult(true); }}
          style={resultStyles.control}><Text style={resultStyles.controlText}>Edit Product</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Refresh prices" disabled={busy || !parsed.success || !countryInfo(country)} onPress={compare}
          style={[resultStyles.control, (busy || !parsed.success || !countryInfo(country)) && styles.disabled]}>
          <Text style={resultStyles.controlText}>{busy ? "Refreshing…" : "Refresh"}</Text>
        </Pressable>
      </View>
    </View>}
    {showForm && <>
    <Text style={styles.title}>Confirm the exact product</Text>
    <Text style={styles.text}>Is this the same item? Check the model, size, color and pack shown on your product. Similar-looking products can be different versions.</Text>
    {!editing && <View style={styles.card}>
      <Text style={styles.label}>{product}</Text>
      <Text style={styles.text}>One item · {condition === "new" ? "New" : "Used"} · Using the variant in the listing title. Add any missing size or color before confirming.</Text>
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => setEditing(true)}><Text style={styles.link}>Correct Product or Variant</Text></Pressable>
    </View>}
    {editing && fields.map(([label, value, setter, placeholder]) => <View key={label} style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput accessibilityLabel={label} value={value} editable={!busy} onChangeText={v => { setter(v); changed(); }}
        style={styles.input} placeholder={placeholder} placeholderTextColor={Colors.light.textSecondary}
        maxLength={label === "Brand and exact model" ? 180 : 60} keyboardType={label === "Pack quantity" ? "number-pad" : "default"} />
    </View>)}
    {editing && <Text style={styles.text}>Use N/A only when a field does not apply or the exact variant is already included in the model/title.</Text>}
    <Text style={styles.label}>Condition</Text>
    <View style={styles.row}>{(["new", "used"] as const).map(value =>
      <Pressable accessibilityRole="radio" accessibilityState={{ checked: condition === value, disabled: busy }} disabled={busy}
        key={value} onPress={() => { setCondition(value); changed(); }} style={[styles.card, condition === value && styles.selected]}>
        <Text style={styles.label}>{value === "new" ? "New" : "Used"}</Text>
      </Pressable>)}</View>
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: confirmed, disabled: busy }} disabled={busy}
      onPress={() => { setConfirmed(!confirmed); setResult(null); }} style={[styles.card, confirmed && styles.selected]}>
      <Text style={styles.label}>{confirmed ? "Confirmed" : "Tap to confirm"}: I checked the model, size, color, quantity, and condition.</Text>
    </Pressable>
    <Text style={styles.text}>Find the lowest listed product price among the stores we find. Confirm the final price on the store’s website.</Text>
    <Pressable accessibilityRole="button" disabled={busy || !parsed.success || !countryInfo(country)}
      style={[styles.button, (busy || !parsed.success || !countryInfo(country)) && styles.disabled]} onPress={compare}>
      {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{result ? "Refresh Prices" : "Find the Lowest Price"}</Text>}
    </Pressable>
    </>}
    {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {result && <View style={styles.section}>
      <View style={resultStyles.heading}>
        <Text style={styles.title}>Shopping Results</Text>
        <Text style={resultStyles.meta}>{countryInfo(result.country)?.[1]}</Text>
      </View>
      <Text style={resultStyles.meta}>Updated {new Date(result.fetchedAt).toLocaleString()} · {result.currency}</Text>
      {visibleOffers.length > 0 && <PriceSortControl value={priceSort} onChange={setPriceSort} />}
      <Text style={resultStyles.note}>Price sorting applies to comparable offers. Check the item and final price at the store.</Text>
      {result.offers.filter(offer => offer.titleMatches).length === 0 && <Text accessibilityRole="alert" style={styles.text}>No priced listings matched these product details. Try correcting the model or variant. We will not show a different product as a cheaper alternative.</Text>}
      {visibleOffers.map((offer, index) => <ShoppingOfferCard
        key={`${offer.url}-${index}`} offer={offer}
        cheapest={offer === cheapestOffer} onOpen={openOffer}
      />)}
      {result.offers.some(offer => !offer.titleMatches) && <Text style={styles.text}>Listings that did not match your product details were hidden.</Text>}
    </View>}
  </View>;
}

const resultStyles = StyleSheet.create({
  summary: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, backgroundColor: Colors.light.surfaceElevated, borderRadius: 10, borderWidth: 1, borderColor: Colors.light.border },
  summaryCopy: { flex: 1, gap: 4 },
  eyebrow: { color: Colors.light.textSecondary, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  meta: { color: Colors.light.textSecondary, fontSize: 12, lineHeight: 17 },
  controls: { gap: 2, alignItems: "flex-end" },
  control: { minHeight: 38, justifyContent: "center", paddingHorizontal: 5 },
  controlText: { color: Colors.light.accent, fontSize: 12, fontWeight: "600" },
  heading: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 6 },
  note: { color: Colors.light.textSecondary, fontSize: 12, lineHeight: 18 },
});
