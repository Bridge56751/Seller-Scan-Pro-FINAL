import { View, Text, StyleSheet, Pressable, Platform, ScrollView, Linking, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";

const PRIVACY_URL = "https://example.com/privacy";
const EULA_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

function dismissPaywall() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(tabs)");
  }
}

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { freeScansLeft } = useAuth();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const topPadding = Math.max(insets.top, webTopInset);

  const scansUsedUp = freeScansLeft <= 0;

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <FeatureRow icon="dollar-sign" text="Instant profit & ROI calculator" />
            <FeatureRow icon="trending-up" text="Price & sales rank history" />
            <FeatureRow icon="users" text="Competitor & Buy Box analysis" />
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.priceCardTitle}>Seller Scan Pro</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>$4.99</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>
            <Text style={styles.priceDuration}>Monthly subscription</Text>
          </View>

          <Pressable style={styles.upgradeButton} onPress={() => {/* RevenueCat purchase flow */}}>
            <Text style={styles.upgradeButtonText}>Subscribe Now</Text>
          </Pressable>

          <Text style={styles.renewalDisclosure}>
            Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews at $4.99/month unless canceled at least 24 hours before the end of the current billing period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel your subscription in your device's Settings {">"} Apple ID {">"} Subscriptions.
          </Text>

          <Pressable
            style={styles.restoreButton}
            onPress={() => {
              if (Platform.OS === "web") {
                alert("Restore Purchases is only available on iOS.");
              } else {
                Alert.alert("Restore Purchases", "Checking for previous purchases...");
              }
            }}
          >
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </Pressable>

          <View style={styles.legalLinks}>
            <Pressable onPress={() => Linking.openURL(PRIVACY_URL)}>
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </Pressable>
            <Text style={styles.legalSeparator}>|</Text>
            <Pressable onPress={() => Linking.openURL(EULA_URL)}>
              <Text style={styles.legalLinkText}>Terms of Use (EULA)</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 32,
    alignItems: "center",
    paddingBottom: 40,
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
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    width: "100%",
    gap: 14,
    marginBottom: 28,
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
  priceCard: {
    width: "100%",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.accent,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  priceCardTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  pricePeriod: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.light.textSecondary,
    marginLeft: 2,
  },
  priceDuration: {
    fontSize: 13,
    color: Colors.light.textTertiary,
    marginTop: 2,
  },
  upgradeButton: {
    width: "100%",
    height: 52,
    backgroundColor: Colors.light.accent,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700" as const,
  },
  renewalDisclosure: {
    fontSize: 11,
    color: Colors.light.textTertiary,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legalLinkText: {
    fontSize: 12,
    color: Colors.light.accent,
    fontWeight: "500" as const,
  },
  restoreButton: {
    paddingVertical: 10,
    marginBottom: 12,
  },
  restoreButtonText: {
    fontSize: 13,
    color: Colors.light.accent,
    fontWeight: "500" as const,
    textAlign: "center" as const,
  },
  legalSeparator: {
    fontSize: 12,
    color: Colors.light.textTertiary,
  },
});
