import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Feather name="x" size={24} color={Colors.light.text} />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="lock" size={40} color={Colors.light.accent} />
        </View>

        <Text style={styles.title}>Free Scans Used Up</Text>
        <Text style={styles.subtitle}>
          You've used all 5 of your free product scans. Upgrade to Seller Scan Pro for unlimited scanning.
        </Text>

        <View style={styles.featuresContainer}>
          <FeatureRow icon="zap" text="Unlimited product scans" />
          <FeatureRow icon="bar-chart-2" text="Full profit analysis" />
          <FeatureRow icon="trending-up" text="Price & rank history charts" />
          <FeatureRow icon="bell" text="Product alerts & warnings" />
        </View>

        <Pressable style={styles.upgradeButton} onPress={() => {/* RevenueCat purchase flow */}}>
          <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
        </Pressable>

        <Text style={styles.priceNote}>Coming soon</Text>
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
  closeButton: {
    alignSelf: "flex-end",
    padding: 16,
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
