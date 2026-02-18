import { View, Text, StyleSheet, Platform, Pressable, ActivityIndicator } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Colors from "@/constants/colors";

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAppleSignIn() {
    setError(null);
    setIsSigningIn(true);

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const fullName = credential.fullName
        ? [credential.fullName.givenName, credential.fullName.familyName]
            .filter(Boolean)
            .join(" ") || undefined
        : undefined;

      await signIn(
        credential.user,
        credential.email || undefined,
        fullName,
        credential.identityToken || undefined,
      );
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // User cancelled
      } else {
        setError("Sign in failed. Please try again.");
        console.error("[Auth] Apple sign-in error:", e);
      }
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleWebSignIn() {
    setError(null);
    setIsSigningIn(true);
    try {
      const testId = "web-test-user-" + Date.now().toString(36);
      await signIn(testId, "test@example.com", "Test User");
    } catch {
      setError("Sign in failed.");
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Feather name="bar-chart-2" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.appName}>Seller Scan</Text>
        <Text style={styles.tagline}>Smart product analysis for Amazon sellers</Text>
      </View>

      <View style={styles.signInContainer}>
        {Platform.OS === "ios" ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        ) : (
          <Pressable style={styles.webButton} onPress={handleWebSignIn} disabled={isSigningIn}>
            {isSigningIn ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="log-in" size={20} color="#FFFFFF" />
                <Text style={styles.webButtonText}>Sign In (Dev Mode)</Text>
              </>
            )}
          </Pressable>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.disclaimer}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 32,
    justifyContent: "space-between",
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.light.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  signInContainer: {
    alignItems: "center",
    gap: 16,
  },
  appleButton: {
    width: "100%",
    height: 52,
  },
  webButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#000000",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  webButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  errorText: {
    color: Colors.light.danger,
    fontSize: 13,
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
