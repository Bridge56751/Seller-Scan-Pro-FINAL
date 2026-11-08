import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useScanSession } from "@/lib/scan-session";
import ShoppingOfferCard from "@/components/shopping/ShoppingOfferCard";
import type { ShoppingOffer } from "@/shared/shopping";

type Condition = "any" | "new" | "used";

export default function ScanResultsScreen() {
  const { session, busy, capture, refine, retry } = useScanSession();
  const [showRefine, setShowRefine] = useState(false);
  const [query, setQuery] = useState(session.query);
  const [condition, setCondition] = useState<Condition>("any");
  const [localError, setLocalError] = useState<string | null>(null);
  const [openingUrl, setOpeningUrl] = useState(false);
  const actionLock = useRef(false);
  const linkLock = useRef(false);
  const isWeb = Platform.OS === "web";
  const processing = session.stage === "identifying" || session.stage === "searching";
  const hasSearch = !!session.result;
  const offers = session.result?.offers || [];
  const rankable = (offer: ShoppingOffer) => offer.titleMatches && !offer.restricted &&
    !!session.result?.currency && offer.currency === session.result.currency &&
    typeof offer.amount === "number" && Number.isFinite(offer.amount);
  const ranked = offers.filter(rankable).sort((a, b) => a.amount! - b.amount!);
  const related = offers.filter(offer => !rankable(offer));
  const lowest = ranked[0]?.amount;

  useEffect(() => { setQuery(session.query); }, [session.query]);

  async function scanAgain() {
    if (busy || actionLock.current || isWeb) return;
    actionLock.current = true;
    setLocalError(null);
    try {
      if (await capture()) {
        setShowRefine(false);
        setCondition("any");
      }
    } catch { setLocalError("The camera could not open. Please try again."); }
    finally { actionLock.current = false; }
  }

  async function search(value = query) {
    if (busy || actionLock.current) return;
    const clean = value.trim();
    if (clean.length < 3 || clean.length > 180) {
      setLocalError("Enter a product name between 3 and 180 characters.");
      return;
    }
    actionLock.current = true;
    Keyboard.dismiss();
    setQuery(clean);
    setLocalError(null);
    try { await refine(clean, condition); }
    catch { setLocalError("Could not update the search. Please try again."); }
    finally { actionLock.current = false; }
  }

  async function retrySearch() {
    if (busy || actionLock.current) return;
    actionLock.current = true;
    setLocalError(null);
    try { await retry(); }
    catch { setLocalError("Could not retry the search. Please try again."); }
    finally { actionLock.current = false; }
  }

  async function openListing(url: string) {
    if (linkLock.current) return;
    linkLock.current = true;
    setOpeningUrl(true);
    setLocalError(null);
    try {
      if (!/^https?:\/\//i.test(url)) throw new Error("Invalid listing link");
      await Linking.openURL(url);
    } catch { setLocalError("This listing could not open. Try another store or try the link again."); }
    finally { linkLock.current = false; setOpeningUrl(false); }
  }

  async function openSettings() {
    try { await Linking.openSettings(); }
    catch { setLocalError("Open your phone’s Settings manually to allow camera access."); }
  }

  function openRefinement() {
    setShowRefine(value => !value);
    setLocalError(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to scan" onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} style={styles.back}><Feather name="arrow-left" size={22} color={Colors.light.text} /></Pressable>
        <Text style={styles.headerTitle}>Scan Results</Text>
        <View style={styles.headerSpacer} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {session.photoUri ? <View style={styles.product}>
            <Image source={{ uri: session.photoUri }} resizeMode="contain" style={styles.photo} accessibilityLabel="Your scanned product photo" />
            <View style={styles.productCopy}>
              <Text style={styles.eyebrow}>YOUR SCAN</Text>
              <Text style={styles.productTitle} numberOfLines={4}>{session.query || (processing ? "Looking at your photo…" : "What did you find?")}</Text>
              <Text style={styles.caption}>{session.query ? "Possible match · not confirmed" : "Your photo is the starting point."}</Text>
            </View>
          </View> : !processing && !hasSearch && !session.query && <View style={styles.empty}>
            <View style={styles.emptyIcon}><Feather name="camera" size={30} color={Colors.light.accent} /></View>
            <Text style={styles.emptyTitle}>Your next find starts here</Text>
            <Text style={styles.body}>Scan a product to discover possible matches and compare store listings. Or search by name below.</Text>
          </View>}
          {!session.photoUri && !!session.query && <View style={styles.productCopy}>
            <Text style={styles.eyebrow}>YOUR SEARCH</Text>
            <Text style={styles.productTitle}>{session.query}</Text>
          </View>}

          {processing && <View accessibilityRole="progressbar" accessibilityLabel={session.stage === "identifying" ? "Finding possible visual matches" : "Searching store listings"} style={styles.progress}>
            <View style={styles.progressTop}><ActivityIndicator color={Colors.light.accent} size="small" /><Text style={styles.progressTitle}>{session.stage === "identifying" ? "Finding possible matches" : "Searching store listings"}</Text></View>
            <Text style={styles.body}>{session.stage === "identifying" ? "Looking for similar products in your photo. This can take up to a minute." : "Checking prices for the suggested product. Similar-looking items may differ."}</Text>
            <View style={styles.progressSteps}>
              <Text style={[styles.progressStep, session.stage === "identifying" && styles.activeStep]}>1  Photo search</Text>
              <Feather name="chevron-right" size={14} color={Colors.light.textTertiary} />
              <Text style={[styles.progressStep, session.stage === "searching" && styles.activeStep]}>2  Store listings</Text>
            </View>
          </View>}

          {(localError || session.error) && <View style={styles.errorBox}>
            <Feather name="alert-circle" size={18} color={Colors.light.danger} />
            <View style={styles.flex}><Text accessibilityRole="alert" style={styles.error}>{localError || session.error}</Text>
              {session.needsSettings && <Pressable accessibilityRole="button" onPress={openSettings} style={styles.inlineAction}><Text style={styles.linkText}>Open Camera Settings</Text></Pressable>}
              {session.stage === "error" && !busy && <Pressable accessibilityRole="button" onPress={retrySearch} style={styles.inlineAction}><Text style={styles.linkText}>Retry Search</Text></Pressable>}
            </View>
          </View>}
          {openingUrl && <Text accessibilityLiveRegion="polite" style={styles.caption}>Opening store listing…</Text>}

          {!processing && hasSearch && offers.length > 0 && <>
            <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Possible matches</Text><Text style={styles.count}>{offers.length} {offers.length === 1 ? "listing" : "listings"}</Text></View>
            <Text style={styles.body}>Check the model, size, color and condition at the store before buying. These listings may not be the item in your photo.</Text>
            {ranked.length > 0 && <Text style={styles.rankingNote}>Lowest listed price among comparable matching titles in {session.result?.currency}. Check the exact item and final price at the store.</Text>}
            {ranked.map((offer, index) => <ShoppingOfferCard key={`ranked-${offer.url}-${index}`} offer={offer} ranked cheapest={offer.amount === lowest} onOpen={openListing} />)}
            {related.length > 0 && <>
              <Text style={styles.relatedTitle}>Other related listings</Text>
              <Text style={styles.body}>These may differ in product, currency or offer conditions. They are not included in the lowest-price comparison.</Text>
              {related.map((offer, index) => <ShoppingOfferCard key={`related-${offer.url}-${index}`} offer={offer} ranked={false} cheapest={false} onOpen={openListing} />)}
            </>}
          </>}

          {!processing && session.stage === "ready" && offers.length === 0 && <View style={styles.empty}>
            <View style={styles.emptyIcon}><Feather name="search" size={28} color={Colors.light.accent} /></View>
            <Text style={styles.emptyTitle}>{hasSearch ? "No listings found this time" : "No clear visual matches"}</Text>
            <Text style={styles.body}>{hasSearch ? "Try a shorter product name or a different condition. You can also scan the label from another angle." : "Try a clearer photo of the product label, or enter a name below to search stores."}</Text>
          </View>}

          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showRefine, disabled: busy }} disabled={busy} onPress={openRefinement} style={({ pressed }) => [styles.refineToggle, (pressed || busy) && styles.dimmed]}>
            <Feather name="sliders" size={18} color={Colors.light.accent} />
            <Text style={styles.refineToggleText}>{showRefine ? "Hide Search Details" : session.query ? "Refine Search / Wrong Item?" : "Search by Product Name"}</Text>
            <Feather name={showRefine ? "chevron-up" : "chevron-down"} size={17} color={Colors.light.accent} />
          </Pressable>
          {showRefine && <View style={styles.refineCard}>
            <Text style={styles.fieldLabel}>Product name</Text>
            <TextInput value={query} onChangeText={setQuery} editable={!busy} maxLength={180} placeholder="e.g. insulated water bottle 24 oz" placeholderTextColor={Colors.light.textTertiary} style={styles.input} accessibilityLabel="Product name for listing search" returnKeyType="search" onSubmitEditing={() => search()} />
            <Text style={styles.fieldLabel}>Condition</Text>
            <View style={styles.filters}>{(["any", "new", "used"] as const).map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: condition === value, disabled: busy }} disabled={busy} onPress={() => setCondition(value)} style={[styles.filter, condition === value && styles.selectedFilter]}><Text style={[styles.filterText, condition === value && styles.selectedFilterText]}>{value === "any" ? "Any condition" : value === "new" ? "New" : "Used"}</Text></Pressable>)}</View>
            <Pressable accessibilityRole="button" disabled={busy || query.trim().length < 3} accessibilityState={{ disabled: busy || query.trim().length < 3 }} onPress={() => search()} style={[styles.searchButton, (busy || query.trim().length < 3) && styles.dimmed]}><Text style={styles.primaryText}>Search Listings</Text><Feather name="arrow-right" size={18} color={Colors.light.surface} /></Pressable>
            {session.matches.filter(match => match.title !== session.query).length > 0 && <>
              <Text style={styles.fieldLabel}>Or try another visual suggestion</Text>
              {session.matches.filter(match => match.title !== session.query).slice(0, 4).map((match, index) => <Pressable key={`${match.title}-${index}`} accessibilityRole="button" accessibilityLabel={`Search possible match: ${match.title}`} disabled={busy} onPress={() => search(match.title)} style={styles.suggestion}><Feather name="search" size={15} color={Colors.light.textSecondary} /><Text style={styles.suggestionText} numberOfLines={2}>{match.title}</Text><Feather name="arrow-up-right" size={16} color={Colors.light.accent} /></Pressable>)}
            </>}
          </View>}
          <Pressable accessibilityRole="link" onPress={() => router.push("/photo-privacy")} style={styles.privacy}><Text style={styles.privacyText}>Photo & Shopping Privacy</Text></Pressable>
        </ScrollView>
        <View style={styles.footer}>
          {isWeb ? <Text style={styles.webNote}>Use the iPhone or Android app to scan with your native camera.</Text> : <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} disabled={busy} onPress={scanAgain} style={({ pressed }) => [styles.scanButton, (busy || pressed) && styles.dimmed]}><Feather name="camera" size={20} color={Colors.light.surface} /><Text style={styles.primaryText}>{busy ? "Scan in progress…" : session.photoUri ? "Scan Again" : "Scan a Product"}</Text></Pressable>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerSpacer: { width: 44 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: Colors.light.text },
  content: { padding: 20, paddingBottom: 28, gap: 14 },
  product: { flexDirection: "row", gap: 16, padding: 14, borderRadius: 16, backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border },
  photo: { width: 104, height: 128, backgroundColor: Colors.light.surfaceElevated, borderRadius: 10 },
  productCopy: { flex: 1, gap: 8, justifyContent: "center" },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, color: Colors.light.accent },
  productTitle: { fontSize: 17, lineHeight: 23, fontWeight: "700", letterSpacing: -0.3, color: Colors.light.text },
  caption: { fontSize: 11, lineHeight: 17, color: Colors.light.textSecondary },
  progress: { padding: 20, borderRadius: 16, backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border, gap: 12 },
  progressTop: { flexDirection: "row", gap: 10, alignItems: "center" },
  progressTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: Colors.light.text },
  progressSteps: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, paddingTop: 8 },
  progressStep: { fontSize: 11, color: Colors.light.textSecondary },
  activeStep: { color: Colors.light.accent, fontWeight: "700" },
  sectionHeading: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginTop: 8 },
  sectionTitle: { fontSize: 22, fontWeight: "700", letterSpacing: -0.5, color: Colors.light.text },
  count: { fontSize: 12, color: Colors.light.textSecondary },
  body: { fontSize: 13, lineHeight: 20, color: Colors.light.textSecondary },
  rankingNote: { fontSize: 11, lineHeight: 17, color: Colors.light.accent, backgroundColor: Colors.light.accentDim, padding: 12, borderRadius: 10 },
  relatedTitle: { fontSize: 17, fontWeight: "600", color: Colors.light.text, marginTop: 12 },
  empty: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 12, gap: 12 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.light.accentDim, justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: Colors.light.text, textAlign: "center" },
  errorBox: { flexDirection: "row", gap: 10, padding: 14, backgroundColor: Colors.light.dangerBg, borderRadius: 12 },
  error: { fontSize: 13, lineHeight: 20, color: Colors.light.danger },
  inlineAction: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
  linkText: { fontSize: 13, fontWeight: "600", color: Colors.light.accent },
  refineToggle: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.border, backgroundColor: Colors.light.surface },
  refineToggleText: { flex: 1, fontSize: 13, fontWeight: "600", color: Colors.light.accent },
  refineCard: { padding: 16, gap: 12, borderRadius: 14, backgroundColor: Colors.light.surface, borderWidth: 1, borderColor: Colors.light.border },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: Colors.light.textSecondary },
  input: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, lineHeight: 20, borderRadius: 9, borderWidth: 1, borderColor: Colors.light.border, backgroundColor: Colors.light.surfaceElevated, color: Colors.light.text },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filter: { minHeight: 44, paddingHorizontal: 13, justifyContent: "center", borderRadius: 9, borderWidth: 1, borderColor: Colors.light.border },
  selectedFilter: { borderColor: Colors.light.accent, backgroundColor: Colors.light.accentDim },
  filterText: { fontSize: 12, color: Colors.light.textSecondary },
  selectedFilterText: { color: Colors.light.accent, fontWeight: "600" },
  searchButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: Colors.light.accent, borderRadius: 10, padding: 12 },
  suggestion: { flexDirection: "row", alignItems: "center", minHeight: 48, paddingVertical: 10, gap: 9, borderTopWidth: 1, borderTopColor: Colors.light.borderLight },
  suggestionText: { flex: 1, fontSize: 12, lineHeight: 18, color: Colors.light.text },
  privacy: { padding: 12, alignSelf: "center" },
  privacyText: { color: Colors.light.accent, fontSize: 11 },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: Colors.light.border, backgroundColor: Colors.light.background },
  scanButton: { backgroundColor: Colors.light.accent, borderRadius: 14, minHeight: 54, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10, padding: 14 },
  primaryText: { color: Colors.light.surface, fontSize: 15, fontWeight: "600" },
  dimmed: { opacity: 0.5 },
  webNote: { fontSize: 12, lineHeight: 18, color: Colors.light.textSecondary, textAlign: "center", paddingVertical: 5 },
});
