import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { loadProPaywallPlan, purchaseBillingTest, restoreBillingTest } from "@/lib/revenuecat";
import type { ProPaywallPlan } from "@/shared/paywall-plan";

const C = Colors.light;
const PRIVACY_URL = "https://sellerscanpro.com/privacy.html";
const TERMS_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
type Action = "purchase" | "restore";
type Notice = { kind: "error" | "success" | "neutral"; text: string; retry?: Action };

const benefits = [
  { icon: "camera" as const, title: "Find it with a photo or barcode", text: "Identify the item in front of you, from either a picture or its barcode." },
  { icon: "shopping-bag" as const, title: "Compare places to buy", text: "Explore marketplace price listings to look for a better deal." },
  { icon: "search" as const, title: "Keep looking for less", text: "Run additional price searches and refine your results." },
];

export default function PaywallScreen() {
  const { isPaid, purchaseSubscription, restorePurchases } = useAuth();
  const [plan, setPlan] = useState<ProPaywallPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Action | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const locked = useRef(false);
  const mounted = useRef(true);
  const preview = __DEV__ && (Platform.OS === "web" || Constants.executionEnvironment === ExecutionEnvironment.StoreClient);
  const testMode = plan?.mode === "test" || preview;
  const alreadyPro = !testMode && (isPaid || verifiedSuccess);

  const loadPlan = useCallback(async () => {
    if (locked.current) return;
    locked.current = true;
    setLoading(true);
    setPricingError(null);
    setPlan(null);
    try {
      const nextPlan = await loadProPaywallPlan();
      if (mounted.current) setPlan(nextPlan);
    } catch (error) {
      if (mounted.current) setPricingError(error instanceof Error ? error.message : "Pricing could not load. Please try again.");
    } finally {
      locked.current = false;
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void loadPlan();
    return () => { mounted.current = false; };
  }, [loadPlan]);

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace("/settings");
  }

  async function openLink(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      if (mounted.current) setNotice({ kind: "error", text: "This link could not open. Please try the link again." });
    }
  }

  async function act(action: Action) {
    if (locked.current || (action === "purchase" && (!plan || alreadyPro))) return;
    locked.current = true;
    setBusy(action);
    setNotice(null);
    try {
      if (testMode) {
        if (action === "purchase") {
          const result = await purchaseBillingTest();
          if (!mounted.current) return;
          if (result.cancelled) {
            setNotice({ kind: "neutral", text: "Test purchase cancelled. No charges were made." });
          } else {
            setTestSuccess(result.state.hasTestAccess);
            setNotice(result.state.hasTestAccess
              ? { kind: "success", text: "Test subscription verified in the Test Store only. No real charges. Real scans have not been unlocked." }
              : { kind: "error", text: "The Test Store has not verified test access yet. Try restoring test purchases.", retry: "restore" });
          }
        } else {
          const state = await restoreBillingTest();
          if (!mounted.current) return;
          setTestSuccess(state.hasTestAccess);
          setNotice({
            kind: state.hasTestAccess ? "success" : "neutral",
            text: state.hasTestAccess
              ? "Test subscription restored in the Test Store only. No real charges. Real scans have not been unlocked."
              : "No active test subscription was found. Real App Store purchases can only be restored in the native app.",
          });
        }
      } else if (action === "purchase" && plan) {
        const result = await purchaseSubscription(plan.productId);
        if (!mounted.current) return;
        if (result.success) {
          setVerifiedSuccess(true);
          setNotice({ kind: "success", text: "Your Pro subscription is verified. You're ready to keep comparing." });
        } else if (result.error === "cancelled") {
          setNotice({ kind: "neutral", text: "Purchase cancelled. You haven't been charged." });
        } else {
          setNotice({ kind: "error", text: result.error || "Your purchase could not be verified. Please try again.", retry: "purchase" });
        }
      } else {
        const result = await restorePurchases();
        if (!mounted.current) return;
        if (result.success && result.isPro) {
          setVerifiedSuccess(true);
          setNotice({ kind: "success", text: "Your Pro subscription has been restored and verified." });
        } else if (result.error === "cancelled") {
          setNotice({ kind: "neutral", text: "Restore cancelled." });
        } else {
          setNotice({
            kind: result.success ? "neutral" : "error",
            text: result.error || "No active subscription was found for this App Store account.",
            ...(!result.success ? { retry: "restore" as const } : {}),
          });
        }
      }
    } catch (error) {
      if (mounted.current) setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not connect to the store. Please try again.", retry: action });
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(null);
    }
  }

  const purchaseDisabled = loading || !!busy || !plan || alreadyPro;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.navigation}>
        <Text style={styles.navigationTitle}>SELLER SCAN</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Close subscription screen" hitSlop={8} onPress={close}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
          <Feather name="x" size={21} color={C.textSecondary} />
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <Image source={require("@/assets/images/logo.png")} accessibilityLabel="Seller Scan logo" style={styles.heroIcon} resizeMode="contain" />
            <Text accessibilityRole="header" style={styles.title}>Seller Scan <Text style={styles.pro}>Pro</Text></Text>
            <Text style={styles.headline}>A second look.{"\n"}A better buy.</Text>
            <Text style={styles.subtitle}>Spot something you like? Find it, compare prices, and see where to buy it for less.</Text>
          </View>

          <View style={styles.benefits}>
            {benefits.map((benefit, index) => (
              <View key={benefit.title} style={[styles.benefit, index > 0 && styles.benefitBorder]}>
                <View style={styles.benefitIcon}><Feather name={benefit.icon} size={21} color={C.accent} /></View>
                <View style={styles.flex}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitText}>{benefit.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.planCard}>
            <View style={styles.planTop}>
              <Text style={styles.planName}>{testMode ? "Test monthly plan" : "Monthly membership"}</Text>
              <View style={styles.planBadge}><Text style={styles.planBadgeText}>{testMode ? "TEST" : "PRO"}</Text></View>
            </View>
            {alreadyPro ? (
              <View style={styles.priceBlock}>
                <Text style={styles.price}>Already Pro</Text>
                <Text style={styles.renewal}>Your verified subscription is active.</Text>
              </View>
            ) : loading ? (
              <View accessibilityLabel="Loading store pricing" accessibilityState={{ busy: true }} style={styles.priceBlock}>
                <View style={styles.priceSkeleton} />
                <Text style={styles.renewal}>Getting the current store price…</Text>
              </View>
            ) : plan ? (
              <View style={styles.priceBlock}>
                <Text style={styles.price}>{plan.price}<Text style={styles.period}> / month</Text></Text>
                <Text style={styles.renewal}>{testMode ? "Simulated monthly subscription · no real charges" : "Billed monthly. Auto-renews until cancelled."}</Text>
              </View>
            ) : (
              <View style={styles.priceBlock}>
                <Text accessibilityRole="alert" style={styles.pricingError}>{pricingError || "Store pricing is unavailable."}</Text>
                <Pressable accessibilityRole="button" onPress={() => void loadPlan()} disabled={!!busy}
                  style={({ pressed }) => [styles.retryPricing, pressed && styles.pressed]}>
                  <Feather name="refresh-cw" size={15} color={C.accent} />
                  <Text style={styles.inlineLink}>Retry pricing</Text>
                </Pressable>
              </View>
            )}
            {notice && (
              <View accessibilityLiveRegion="polite" accessibilityRole={notice.kind === "error" ? "alert" : undefined}
                style={[styles.notice, notice.kind === "error" && styles.errorNotice, notice.kind === "success" && styles.successNotice]}>
                <Text style={[styles.noticeText, notice.kind === "error" && styles.errorText]}>{notice.text}</Text>
                {notice.retry && (
                  <Pressable accessibilityRole="button" disabled={!!busy || loading || (notice.retry === "purchase" && !plan)}
                    onPress={() => void act(notice.retry!)} style={({ pressed }) => [styles.noticeRetry, pressed && styles.pressed]}>
                    <Text style={styles.inlineLink}>Try again</Text>
                  </Pressable>
                )}
              </View>
            )}
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: purchaseDisabled, busy: busy === "purchase" }}
              disabled={purchaseDisabled} onPress={() => void act("purchase")}
              style={({ pressed }) => [styles.subscribe, purchaseDisabled && !alreadyPro && styles.disabled, alreadyPro && styles.activeButton, pressed && styles.buttonPressed]}>
              <Text style={[styles.subscribeText, alreadyPro && styles.activeButtonText]}>
                {busy === "purchase" ? (testMode ? "Verifying test purchase…" : "Confirming subscription…") : alreadyPro ? "Already Pro" : loading ? "Loading price…" : testMode ? (testSuccess ? "Test Subscribe Again" : "Test Subscribe") : "Subscribe to Pro"}
              </Text>
              {!busy && !loading && !alreadyPro && <Feather name="arrow-right" size={19} color={C.surface} />}
              {alreadyPro && <Feather name="check" size={19} color={C.accent} />}
            </Pressable>
            {alreadyPro && (
              <Pressable accessibilityRole="button" onPress={close} style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}>
                <Text style={styles.inlineLink}>Continue shopping</Text>
              </Pressable>
            )}
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!busy || loading, busy: busy === "restore" }}
              disabled={!!busy || loading} onPress={() => void act("restore")}
              style={({ pressed }) => [styles.textButton, (!!busy || loading) && styles.disabled, pressed && styles.pressed]}>
              <Text style={styles.restoreText}>{busy === "restore" ? "Checking purchases…" : testMode ? "Restore test purchases" : "Restore purchases"}</Text>
            </Pressable>
          </View>

          <Text style={styles.legalCopy}>
            {testMode
              ? "This is a simulated Test Store purchase, not an App Store subscription. Test access is separate from Seller Scan Pro and cannot be used for real scans."
              : "Payment is charged to your Apple Account at confirmation. Your monthly subscription automatically renews unless cancelled at least 24 hours before the current period ends. Your account is charged for renewal within 24 hours before the period ends. Manage or cancel in App Store account settings."}
          </Text>
          <View style={styles.legalLinks}>
            <Pressable accessibilityRole="link" onPress={() => void openLink(PRIVACY_URL)} style={({ pressed }) => [styles.legalButton, pressed && styles.pressed]}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Pressable>
            <View style={styles.legalDot} />
            <Pressable accessibilityRole="link" onPress={() => void openLink(TERMS_URL)} style={({ pressed }) => [styles.legalButton, pressed && styles.pressed]}>
              <Text style={styles.legalLink}>Terms of Use (EULA)</Text>
            </Pressable>
          </View>
          <View style={styles.allowance}>
            <Feather name="check-circle" size={17} color={C.accent} />
            <View style={styles.flex}>
              <Text style={styles.allowanceTitle}>Up to 1,000 scans per UTC month</Text>
              <Text style={styles.allowanceText}>10 scans per minute. Monthly allowance resets on the first day of each month at 00:00 UTC.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  navigation: { paddingHorizontal: 22, paddingVertical: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  navigationTitle: { color: C.textSecondary, fontSize: 12, fontWeight: "700", letterSpacing: 1.8 },
  close: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 },
  content: { width: "100%", maxWidth: 480, alignSelf: "center" },
  flex: { flex: 1 },
  hero: { alignItems: "center", paddingTop: 22, paddingBottom: 26 },
  heroIcon: { height: 70, width: 70, borderRadius: 23, marginBottom: 18 },
  title: { fontSize: 23, fontWeight: "700", color: C.text, letterSpacing: -0.5 },
  pro: { color: C.accent },
  headline: { fontSize: 35, lineHeight: 41, letterSpacing: -1.2, fontWeight: "800", color: C.text, textAlign: "center", marginTop: 12 },
  subtitle: { color: C.textSecondary, fontSize: 15, lineHeight: 23, textAlign: "center", marginTop: 13, maxWidth: 330 },
  benefits: { borderRadius: 18, backgroundColor: C.surface, paddingHorizontal: 17 },
  benefit: { flexDirection: "row", gap: 13, paddingVertical: 18, alignItems: "flex-start" },
  benefitBorder: { borderTopWidth: 1, borderTopColor: C.borderLight },
  benefitIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: C.accentDim, alignItems: "center", justifyContent: "center" },
  benefitTitle: { fontSize: 15, fontWeight: "600", color: C.text, lineHeight: 21 },
  benefitText: { fontSize: 13, lineHeight: 20, color: C.textSecondary, marginTop: 4 },
  allowance: { flexDirection: "row", gap: 10, paddingHorizontal: 6, marginTop: 18, marginBottom: 22 },
  allowanceTitle: { fontSize: 13, fontWeight: "600", color: C.text, lineHeight: 19 },
  allowanceText: { fontSize: 12, lineHeight: 18, color: C.textSecondary, marginTop: 4 },
  planCard: { borderRadius: 20, padding: 19, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.accent },
  planTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  planName: { color: C.text, fontSize: 15, fontWeight: "600", flex: 1 },
  planBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, backgroundColor: C.accentDim },
  planBadgeText: { color: C.accent, fontSize: 10, letterSpacing: 1, fontWeight: "800" },
  priceBlock: { paddingTop: 14, paddingBottom: 19, gap: 6 },
  price: { color: C.text, fontSize: 30, fontWeight: "700", letterSpacing: -0.8 },
  period: { color: C.textSecondary, fontSize: 15, fontWeight: "400", letterSpacing: 0 },
  renewal: { color: C.textSecondary, fontSize: 12, lineHeight: 18 },
  priceSkeleton: { width: 144, height: 34, borderRadius: 7, backgroundColor: C.borderLight },
  pricingError: { color: C.danger, fontSize: 14, lineHeight: 21 },
  retryPricing: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 7, alignSelf: "flex-start" },
  inlineLink: { color: C.accent, fontSize: 14, fontWeight: "600" },
  subscribe: { minHeight: 54, backgroundColor: C.accent, borderRadius: 13, paddingVertical: 16, paddingHorizontal: 15, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  subscribeText: { color: C.surface, fontSize: 16, fontWeight: "700", textAlign: "center", flexShrink: 1 },
  activeButton: { backgroundColor: C.accentDim },
  activeButtonText: { color: C.accent },
  disabled: { opacity: 0.5 },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  pressed: { opacity: 0.65 },
  textButton: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 5 },
  restoreText: { color: C.textSecondary, fontSize: 13, fontWeight: "600", textAlign: "center" },
  notice: { backgroundColor: C.surfaceElevated, borderRadius: 10, padding: 12, marginBottom: 14 },
  errorNotice: { backgroundColor: C.dangerBg },
  successNotice: { backgroundColor: C.successBg },
  noticeText: { color: C.text, fontSize: 13, lineHeight: 20 },
  errorText: { color: C.danger },
  noticeRetry: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  legalCopy: { color: C.textSecondary, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 20, paddingHorizontal: 5 },
  legalLinks: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", marginTop: 6, columnGap: 8 },
  legalButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 3 },
  legalLink: { color: C.textSecondary, fontSize: 11, textDecorationLine: "underline" },
  legalDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.textTertiary },
});
