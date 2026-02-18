import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert, Linking } from "react-native";
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
  const { user, signOut, deleteAccount } = useAuth();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      signOut();
      return;
    }
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleDeleteAccount = () => {
    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        deleteAccount();
      }
      return;
    }
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all associated data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteAccount() },
      ],
    );
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const scansUsed = user?.scanCount ?? 0;
  const scansRemaining = user?.isPaid ? "Unlimited" : `${Math.max(0, FREE_SCAN_LIMIT - scansUsed)} of ${FREE_SCAN_LIMIT}`;
  const accountType = user?.isPaid ? "Pro" : user?.isGuest ? "Guest" : "Free";

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
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Feather name="user" size={22} color={Colors.light.accent} />
              </View>
              <View style={styles.avatarInfo}>
                <Text style={styles.userName}>{user?.fullName || "Guest User"}</Text>
                <Text style={styles.userEmail}>{user?.email || "No email"}</Text>
              </View>
              <View style={[styles.badge, user?.isPaid && styles.badgePro]}>
                <Text style={[styles.badgeText, user?.isPaid && styles.badgeTextPro]}>{accountType}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Scans remaining</Text>
              <Text style={styles.statValue}>{scansRemaining}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total scans</Text>
              <Text style={styles.statValue}>{scansUsed}</Text>
            </View>
          </View>
        </View>

        {!user?.isPaid && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>
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

        {user?.isGuest && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create Account</Text>
            <View style={styles.card}>
              <Text style={styles.createAccountText}>
                Sign up with Apple to keep your data across devices and unlock additional features.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.appleSignUpButton, pressed && { opacity: 0.9 }]}
                onPress={() => {
                  signOut();
                }}
              >
                <Feather name="user-plus" size={16} color="#FFFFFF" />
                <Text style={styles.appleSignUpText}>Sign Up with Apple</Text>
              </Pressable>
            </View>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.card}>
            <Pressable
              style={({ pressed }) => [styles.menuRow, user?.isGuest && styles.menuRowDisabled, !user?.isGuest && pressed && { backgroundColor: Colors.light.background }]}
              onPress={() => {
                if (user?.isGuest) {
                  if (Platform.OS === "web") {
                    alert("You need to create an account first before you can sign out.");
                  } else {
                    Alert.alert("No Account", "You need to create an account first before you can sign out.");
                  }
                  return;
                }
                handleSignOut();
              }}
            >
              <View style={styles.menuLeft}>
                <Feather name="log-out" size={18} color={user?.isGuest ? Colors.light.textTertiary : Colors.light.textSecondary} />
                <Text style={[styles.menuText, user?.isGuest && { color: Colors.light.textTertiary }]}>Sign Out</Text>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={({ pressed }) => [styles.menuRow, user?.isGuest && styles.menuRowDisabled, !user?.isGuest && pressed && { backgroundColor: Colors.light.dangerDim }]}
              onPress={() => {
                if (user?.isGuest) {
                  if (Platform.OS === "web") {
                    alert("You need to create an account first before you can delete it.");
                  } else {
                    Alert.alert("No Account", "You need to create an account first before you can delete it.");
                  }
                  return;
                }
                handleDeleteAccount();
              }}
            >
              <View style={styles.menuLeft}>
                <Feather name="trash-2" size={18} color={user?.isGuest ? Colors.light.textTertiary : Colors.light.danger} />
                <Text style={[styles.menuText, { color: user?.isGuest ? Colors.light.textTertiary : Colors.light.danger }]}>Delete Account</Text>
              </View>
              <Feather name="chevron-right" size={16} color={user?.isGuest ? Colors.light.textTertiary : Colors.light.danger} />
            </Pressable>
          </View>
        </View>

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
  createAccountText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    padding: 16,
    paddingBottom: 12,
  },
  appleSignUpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#000000",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  appleSignUpText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
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
  menuRowDisabled: {
    opacity: 0.5,
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
