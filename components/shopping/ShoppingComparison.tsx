import { useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, Text, TextInput, View } from "react-native";
import { comparisonSchema, countryInfo, type Comparison } from "@/shared/shopping";
import { compareProduct } from "@/lib/shopping-client";
import Colors from "@/constants/colors";
import { shoppingStyles as styles } from "./styles";

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
  const lock = useRef(false);
  const parsed = comparisonSchema.safeParse({ product, size, color, quantity: Number(quantity), condition, country, confirmed });
  function changed() { setConfirmed(false); setResult(null); setError(null); }
  async function compare() {
    if (!parsed.success || lock.current || !countryInfo(country)) return;
    lock.current = true; setBusy(true); onBusyChange?.(true); setError(null); setResult(null);
    try { setResult(await compareProduct(parsed.data)); }
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
  return <View style={styles.section}>
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
    {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Pressable accessibilityRole="button" disabled={busy || !parsed.success || !countryInfo(country)}
      style={[styles.button, (busy || !parsed.success || !countryInfo(country)) && styles.disabled]} onPress={compare}>
      {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{result ? "Refresh Prices" : "Find the Lowest Price"}</Text>}
    </Pressable>
    {result && <View style={styles.section}>
      <Text style={styles.title}>Shopping results · {countryInfo(result.country)?.[1]}</Text>
      <Text style={styles.text}>Updated {new Date(result.fetchedAt).toLocaleString()}. Matching offers in {result.currency} are sorted by listed product price, not checkout total. Check the exact item before buying.</Text>
      {result.offers.filter(offer => offer.titleMatches).length === 0 && <Text accessibilityRole="alert" style={styles.text}>No priced listings matched these product details. Try correcting the model or variant. We will not show a different product as a cheaper alternative.</Text>}
      {result.offers.filter(offer => offer.titleMatches).map((offer, index) => {
        const ranked = offer.titleMatches && !offer.restricted && offer.currency === result.currency && offer.amount !== null;
        return <View key={`${offer.url}-${index}`} style={styles.card}>
          <Text style={styles.label}>{offer.seller}</Text>
          <Text style={styles.text}>{offer.title}</Text>
          <Text style={styles.title}>{offer.priceText}{offer.currency ? ` ${offer.currency}` : " · currency not supplied"}</Text>
          <Text style={styles.text}>{ranked ? (index === 0 ? "Lowest listed item price among matching titles returned" : "Title matches your details") : "Unranked — verify variant, currency, or offer conditions"}</Text>
          <Text style={styles.text}>Condition: {offer.condition}{offer.restricted ? " · Bundle, conditional, or installment offer; verify full cost and contents" : ""}</Text>
          <Pressable accessibilityRole="link" onPress={() => openOffer(offer.url)}>
            <Text style={styles.link}>View Listing</Text>
          </Pressable>
        </View>;
      })}
      {result.offers.some(offer => !offer.titleMatches) && <Text style={styles.text}>Listings that did not match your product details were hidden.</Text>}
    </View>}
  </View>;
}
