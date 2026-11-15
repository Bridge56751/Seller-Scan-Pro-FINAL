import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { loadBillingTest, purchaseBillingTest, restoreBillingTest } from "@/lib/revenuecat";

type BillingTestState = {
  productTitle: string;
  price: string;
  productIdentifier: string;
  hasTestAccess: boolean;
  expirationDate: string | null;
  customerId: string;
};

type Action = "load" | "purchase" | "refresh" | "restore";
type Notice = { kind: "success" | "cancelled" | "error"; text: string };

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace("/(tabs)/settings");
}

function expirationLabel(value: string | null) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function BillingTestScreen() {
  const [state, setState] = useState<BillingTestState | null>(null);
  const [busy, setBusy] = useState<Action | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const active = useRef(false);
  const mounted = useRef(true);

  async function run(action: Action) {
    if (!__DEV__ || active.current) return;
    active.current = true;
    setBusy(action);
    setNotice(null);
    try {
      if (action === "purchase") {
        const result = await purchaseBillingTest();
        if (!mounted.current) return;
        setState(result.state);
        setNotice(result.cancelled
          ? { kind: "cancelled", text: "Test purchase canceled. The latest test access status is shown below." }
          : { kind: "success", text: result.state.hasTestAccess
            ? "Test purchase completed. Test access is active. No real charges or production unlock."
            : "Test purchase completed, but no active test access was returned. No production access was unlocked." });
      } else {
        const result = action === "restore" ? await restoreBillingTest() : await loadBillingTest();
        if (!mounted.current) return;
        setState(result);
        if (action !== "load") {
          setNotice({
            kind: "success",
            text: action === "restore"
              ? result.hasTestAccess
                ? "Restore completed. Active test access was found. Production access is unchanged."
                : "Restore completed. No active test access was found."
              : "Status refreshed from RevenueCat Test Store.",
          });
        }
      }
    } catch (error) {
      if (mounted.current) {
        setNotice({
          kind: "error",
          text: error instanceof Error ? error.message : "Unable to complete this test action. Check the test configuration and try again.",
        });
      }
    } finally {
      active.current = false;
      if (mounted.current) setBusy(null);
    }
  }

  useEffect(() => {
    mounted.current = true;
    if (__DEV__) void run("load");
    return () => { mounted.current = false; };
  }, []);

  if (!__DEV__) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Billing Test unavailable</Text>
          <Text style={styles.body}>This development-only screen is not available in this build of Seller Scan.</Text>
          <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={goBack}>
            <Text style={styles.secondaryText}>Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>Seller Scan · Development only</Text>
          <Text style={styles.title}>Billing Test</Text>
          <Text style={styles.body}>RevenueCat TEST STORE</Text>
        </View>

        <View style={styles.disclosure}>
          <Text style={styles.disclosureTitle}>Test only. No real charges.</Text>
          <Text style={styles.body}>These actions test billing only. They do not unlock production access or change legacy purchases.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live test product</Text>
          <View style={styles.card}>
            {state ? (
              <>
                <Text style={styles.productTitle}>{state.productTitle}</Text>
                <Text style={styles.price}>{state.price}</Text>
                <Text selectable style={styles.identifier}>{state.productIdentifier}</Text>
              </>
            ) : busy === "load" || busy === "refresh" ? (
              <View accessible accessibilityLabel="Loading test product" style={styles.skeletonGroup}>
                <View style={[styles.skeleton, { width: "74%" }]} />
                <View style={[styles.skeleton, { width: "34%" }]} />
                <Text style={styles.body}>Loading live test product…</Text>
              </View>
            ) : (
              <>
                <Text style={styles.productTitle}>Test product unavailable</Text>
                <Text style={styles.body}>Use Refresh Status to retry loading the test offering and access status.</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test access status</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Test access</Text>
            <Text style={styles.caption}>Verified by the server directly with RevenueCat.</Text>
            <Text style={[styles.status, state?.hasTestAccess && styles.activeStatus]}>
              {state ? state.hasTestAccess ? "Active — test only" : "Not active" : "Not loaded"}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.label}>Test customer ID</Text>
            <Text selectable style={styles.body}>{state?.customerId || "Not loaded"}</Text>
            <View style={styles.divider} />
            <Text style={styles.label}>Test expiration</Text>
            <Text selectable style={styles.body}>{state ? expirationLabel(state.expirationDate) : "Not loaded"}</Text>
            {(busy || notice?.kind === "error") && state && (
              <Text style={styles.caption}>Showing the last successfully loaded status.</Text>
            )}
          </View>
        </View>

        {busy && (
          <Text accessibilityLiveRegion="polite" style={styles.body}>
            {busy === "purchase" ? "Waiting for the test purchase result…" : busy === "restore" ? "Restoring test purchases…" : "Loading test product and status…"}
          </Text>
        )}
        {notice && (
          <View
            accessibilityRole={notice.kind === "error" ? "alert" : undefined}
            accessibilityLiveRegion="polite"
            style={[styles.notice, notice.kind === "error" && styles.errorNotice]}
          >
            <Text style={[styles.body, notice.kind === "error" && styles.errorText]}>{notice.text}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Test Purchase"
            accessibilityHint="Starts a RevenueCat Test Store purchase. No real charges or production unlock."
            accessibilityState={{ disabled: !!busy || !state, busy: busy === "purchase" }}
            disabled={!!busy || !state}
            style={({ pressed }) => [styles.primaryButton, (!!busy || !state) && styles.disabled, pressed && styles.pressed]}
            onPress={() => void run("purchase")}
          >
            <Text style={styles.primaryText}>{busy === "purchase" ? "Testing Purchase…" : "Test Purchase"}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !!busy, busy: busy === "refresh" }}
            disabled={!!busy}
            style={({ pressed }) => [styles.secondaryButton, !!busy && styles.disabled, pressed && styles.pressed]}
            onPress={() => void run("refresh")}
          >
            <Text style={styles.secondaryText}>{busy === "refresh" ? "Refreshing…" : "Refresh Status"}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !!busy, busy: busy === "restore" }}
            disabled={!!busy}
            style={({ pressed }) => [styles.secondaryButton, !!busy && styles.disabled, pressed && styles.pressed]}
            onPress={() => void run("restore")}
          >
            <Text style={styles.secondaryText}>{busy === "restore" ? "Restoring Test Purchase…" : "Restore Test Purchase"}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]} onPress={goBack}>
            <Text style={styles.secondaryText}>Back</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 16, paddingTop: Platform.OS === "web" ? 28 : 16, paddingBottom: 32, gap: 20 },
  heading: { gap: 6 },
  eyebrow: { fontSize: 13, fontWeight: "600", color: Colors.light.textSecondary },
  title: { fontSize: 24, fontWeight: "700", color: Colors.light.text },
  body: { fontSize: 14, lineHeight: 21, color: Colors.light.textSecondary },
  disclosure: { padding: 16, borderRadius: 12, backgroundColor: Colors.light.accentDim, gap: 6 },
  disclosureTitle: { fontSize: 16, fontWeight: "600", color: Colors.light.accent },
  section: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "600", color: Colors.light.textTertiary, textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 },
  card: { backgroundColor: Colors.light.surface, borderRadius: 12, padding: 16, gap: 8 },
  productTitle: { fontSize: 17, fontWeight: "600", color: Colors.light.text },
  price: { fontSize: 22, fontWeight: "700", color: Colors.light.accent },
  identifier: { fontSize: 12, lineHeight: 18, color: Colors.light.textSecondary },
  label: { fontSize: 13, color: Colors.light.textSecondary },
  status: { fontSize: 16, fontWeight: "600", color: Colors.light.text },
  activeStatus: { color: Colors.light.success },
  divider: { height: 1, backgroundColor: Colors.light.border, marginVertical: 4 },
  caption: { fontSize: 12, lineHeight: 18, color: Colors.light.textSecondary },
  skeletonGroup: { gap: 12 },
  skeleton: { height: 20, borderRadius: 5, backgroundColor: Colors.light.borderLight },
  notice: { borderRadius: 12, padding: 16, backgroundColor: Colors.light.accentDim },
  errorNotice: { backgroundColor: Colors.light.dangerBg },
  errorText: { color: Colors.light.danger },
  actions: { gap: 12 },
  primaryButton: { minHeight: 48, padding: 14, borderRadius: 12, backgroundColor: Colors.light.accent, justifyContent: "center", alignItems: "center" },
  primaryText: { fontSize: 15, fontWeight: "600", color: Colors.light.surface, textAlign: "center" },
  secondaryButton: { minHeight: 48, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.border, backgroundColor: Colors.light.surface, justifyContent: "center", alignItems: "center" },
  secondaryText: { fontSize: 15, fontWeight: "600", color: Colors.light.accent, textAlign: "center" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
});
