import { Linking, Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { PHOTO_DISCLOSURE } from "@/shared/shopping";
import { shoppingStyles as styles } from "@/components/shopping/styles";
import Colors from "@/constants/colors";
import { useEffect, useState } from "react";
import { hasPhotoConsent, revokePhotoConsent } from "@/lib/photo-consent";

export default function PhotoPrivacy() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    hasPhotoConsent().then(setEnabled).catch(() => setMessage("Could not read your photo-sharing preference."));
  }, []);
  async function turnOff() {
    try {
      await revokePhotoConsent();
      setEnabled(false);
      setMessage("Automatic identification is off. Your next photo will require permission before upload.");
    } catch { setMessage("Could not change your preference. Please try again."); }
  }
  return <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
    <ScrollView contentContainerStyle={{ padding: 28, gap: 20 }}>
      <Text style={styles.title}>Photo & Shopping Privacy</Text>
      <Text style={styles.text}>{PHOTO_DISCLOSURE}</Text>
      <Text style={styles.text}>Automatic identification: {enabled === null ? "Checking…" : enabled ? "On" : "Off"}</Text>
      {enabled !== false && <Pressable accessibilityRole="button" style={styles.button} onPress={turnOff}>
        <Text style={styles.buttonText}>Turn Off Automatic Identification</Text>
      </Pressable>}
      {!!message && <Text accessibilityRole="alert" style={styles.text}>{message}</Text>}
      <Text style={styles.text}>Product details and your selected country are sent to SearchApi and Google Shopping when you compare prices. No GPS location is requested. These new searches are not added to saved history. Opening a listing sends you to a third-party site with its own privacy policy.</Text>
      <Text style={styles.text}>Provider retention is outside this app’s control. Our app does not log your photo, temporary image link, or search results. Infrastructure access logs may contain request URLs. This disclosure supplements the app’s general privacy policy.</Text>
      {[["SearchApi privacy policy", "https://www.searchapi.io/legal/privacy"], ["Google privacy policy", "https://policies.google.com/privacy"], ["General privacy policy", "https://sellerscanpro.com/privacy.html"]].map(([label, url]) =>
        <Pressable key={url} accessibilityRole="link" onPress={() => Linking.openURL(url)}><Text style={styles.link}>{label}</Text></Pressable>)}
      <Pressable accessibilityRole="button" style={styles.button} onPress={() => router.back()}><Text style={styles.buttonText}>Back</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}
