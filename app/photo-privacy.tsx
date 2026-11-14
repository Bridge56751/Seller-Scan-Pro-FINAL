import { Linking, Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { PHOTO_DISCLOSURE } from "@/shared/shopping";
import { shoppingStyles as styles } from "@/components/shopping/styles";
import Colors from "@/constants/colors";

export default function PhotoPrivacy() {
  return <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
    <ScrollView contentContainerStyle={{ padding: 28, gap: 20 }}>
      <Text style={styles.title}>Photo & Shopping Privacy</Text>
      <Text style={styles.text}>{PHOTO_DISCLOSURE}</Text>
      <Text style={styles.text}>Barcode numbers are read on your device and sent through our server to UPCitemdb to identify products. Barcode camera frames are not uploaded. Product identities may be cached on our server for up to 24 hours to reduce repeat lookups; prices are not cached with them. The free barcode service has limited daily capacity.</Text>
      <Text style={styles.text}>Product details and your selected country are sent to SearchApi and Google Shopping when you compare prices. No GPS location is requested. Your latest 50 photo and barcode scans, including barcode numbers and result snapshots, are saved on this device and can be deleted in History. Opening a listing sends you to a third-party site with its own privacy policy.</Text>
      <Text style={styles.text}>Provider retention is outside this app’s control. Our app does not log your photo, temporary image link, or search results. Infrastructure access logs may contain request URLs. This disclosure supplements the app’s general privacy policy.</Text>
      {[["UPCitemdb service information", "https://www.upcitemdb.com/api"], ["SearchApi privacy policy", "https://www.searchapi.io/legal/privacy"], ["Google privacy policy", "https://policies.google.com/privacy"], ["General privacy policy", "https://sellerscanpro.com/privacy.html"]].map(([label, url]) =>
        <Pressable key={url} accessibilityRole="link" onPress={() => Linking.openURL(url)}><Text style={styles.link}>{label}</Text></Pressable>)}
      <Pressable accessibilityRole="button" style={styles.button} onPress={() => router.back()}><Text style={styles.buttonText}>Back</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}
