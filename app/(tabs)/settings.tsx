import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";

const FREE_SCAN_LIMIT = 5;

const PRIVACY_POLICY_URL = "https://example.com/privacy";
const TERMS_OF_SERVICE_URL = "https://example.com/terms";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isPaid, scanCount, freeScansLeft } = useAuth();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const scansRemaining = isPaid ? "Unlimited" : `${freeScansLeft} of ${FREE_SCAN_LIMIT}`;
  const accountType = isPaid ? "Pro" : "Free";

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + webTopInset + 12 }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + webBottomInset + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.card}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Feather name={isPaid ? "star" : "user"} size={22} color={Colors.light.accent} />
              </View>
              <View style={styles.avatarInfo}>
                <Text style={styles.userName}>Seller Scan {accountType}</Text>
                <Text style={styles.userEmail}>{isPaid ? "Unlimited access" : "Free tier"}</Text>
              </View>
              <View style={[styles.badge, isPaid && styles.badgePro]}>
                <Text style={[styles.badgeText, isPaid && styles.badgeTextPro]}>{accountType}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Scans remaining</Text>
              <Text style={styles.statValue}>{scansRemaining}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total scans</Text>
              <Text style={styles.statValue}>{scanCount}</Text>
            </View>
          </View>
        </View>

        {!isPaid && (
          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [styles.upgradeCard, pressed && { opacity: 0.9 }]}
              onPress={() => router.push("/paywall")}
            >
              <View style={styles.upgradeLeft}>
                <Feather name="zap" size={20} color="#FFFFFF" />
                <View style={styles.upgradeTextContainer}>
                  <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                  <Text style={styles.upgradeSubtitle}>Unlimited scans & full features</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
            </Pressable>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <Pressable
              style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: Colors.light.background }]}
              onPress={() => Linking.openURL("mailto:sellerscanpro@gmail.com")}
            >
              <View style={styles.menuLeft}>
                <Feather name="mail" size={18} color={Colors.light.textSecondary} />
                <Text style={styles.menuText}>Contact Support</Text>
              </View>
              <Text style={styles.supportEmail}>sellerscanpro@gmail.com</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: Colors.light.background }]}
              onPress={() => Linking.openURL("https://sellerscan.com")}
            >
              <View style={styles.menuLeft}>
                <Feather name="globe" size={18} color={Colors.light.textSecondary} />
                <Text style={styles.menuText}>Website</Text>
              </View>
              <Feather name="external-link" size={16} color={Colors.light.textTertiary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <Pressable
              style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: Colors.light.background }]}
              onPress={() => handleOpenLink(PRIVACY_POLICY_URL)}
            >
              <View style={styles.menuLeft}>
                <Feather name="shield" size={18} color={Colors.light.textSecondary} />
                <Text style={styles.menuText}>Privacy Policy</Text>
              </View>
              <Feather name="external-link" size={16} color={Colors.light.textTertiary} />
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: Colors.light.background }]}
              onPress={() => handleOpenLink(TERMS_OF_SERVICE_URL)}
            >
              <View style={styles.menuLeft}>
                <Feather name="file-text" size={18} color={Colors.light.textSecondary} />
                <Text style={styles.menuText}>Terms of Service</Text>
              </View>
              <Feather name="external-link" size={16} color={Colors.light.textTertiary} />
            </Pressable>
          </View>
        </View>

        {isPaid && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manage Subscription</Text>
            <View style={styles.card}>
              <Pressable
                style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: Colors.light.background }]}
                onPress={() => {
                  if (Platform.OS === "ios") {
                    Linking.openURL("https://apps.apple.com/account/subscriptions");
                  } else {
                    Linking.openURL("https://play.google.com/store/account/subscriptions");
                  }
                }}
              >
                <View style={styles.menuLeft}>
                  <Feather name="settings" size={18} color={Colors.light.textSecondary} />
                  <Text style={styles.menuText}>Manage in App Store</Text>
                </View>
                <Feather name="external-link" size={16} color={Colors.light.textTertiary} />
              </Pressable>
            </View>
          </View>
        )}

        <Text style={styles.versionText}>Seller Scan v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.accentDim,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.light.textTertiary,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.light.background,
  },
  badgePro: {
    backgroundColor: Colors.light.accentDim,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  badgeTextPro: {
    color: Colors.light.accent,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  upgradeCard: {
    backgroundColor: Colors.light.accent,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  upgradeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  upgradeSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  supportEmail: {
    fontSize: 12,
    color: Colors.light.textTertiary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 46,
  },
  versionText: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    textAlign: "center",
    marginTop: 8,
  },
});
