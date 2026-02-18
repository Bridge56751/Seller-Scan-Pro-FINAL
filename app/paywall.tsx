import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";

function dismissPaywall() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(tabs)");
  }
}

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const topPadding = Math.max(insets.top, webTopInset);

  const scansUsedUp = user ? user.freeScansLeft <= 0 : false;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Pressable
          style={styles.closeButton}
          onPress={dismissPaywall}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          testID="paywall-close"
        >
          <View style={styles.closeCircle}>
            <Feather name="x" size={18} color={Colors.light.text} />
          </View>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name={scansUsedUp ? "lock" : "star"} size={40} color={Colors.light.accent} />
        </View>

        <Text style={styles.title}>{scansUsedUp ? "Free Scans Used Up" : "Upgrade to Pro"}</Text>
        <Text style={styles.subtitle}>
          {scansUsedUp
            ? "You've used all 5 of your free product scans. Upgrade to Seller Scan Pro for unlimited scanning."
            : "Get the most out of Seller Scan with unlimited product scans and full access to every feature."}
        </Text>

        <View style={styles.featuresContainer}>
          <FeatureRow icon="zap" text="Unlimited product scans" />
          <FeatureRow icon="bar-chart-2" text="Full profit analysis" />
          <FeatureRow icon="trending-up" text="Price & rank history charts" />
          <FeatureRow icon="bell" text="Product alerts & warnings" />
        </View>

        <Pressable style={styles.upgradeButton} onPress={() => {/* RevenueCat purchase flow */}}>
          <Text style={styles.upgradeButtonText}>Upgrade to Pro — $4.99/mo</Text>
        </Pressable>

        <Text style={styles.priceNote}>Cancel anytime. Billed monthly.</Text>
      </View>
    </View>
  );
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIconContainer}>
        <Feather name={icon as any} size={16} color={Colors.light.accent} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.accentDim,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    width: "100%",
    gap: 14,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.light.accentDim,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  upgradeButton: {
    width: "100%",
    height: 52,
    backgroundColor: Colors.light.accent,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700" as const,
  },
  priceNote: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    marginTop: 10,
  },
});
