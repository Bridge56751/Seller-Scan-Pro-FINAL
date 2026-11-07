import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Colors from "@/constants/colors";

export default function ProductDataUnavailable() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Product data is unavailable</Text>
        <Text style={styles.text}>
          Product identification, search, and price comparisons are not connected yet.
          You can take and review a product photo in the Scan tab. No new subscription is needed.
        </Text>
        <Text style={styles.text}>
          Your saved history is still available. Existing subscriptions are not automatically
          canceled; you can manage or restore purchases in Settings.
        </Text>
        <Pressable accessibilityRole="button" style={styles.button} onPress={() => router.replace("/(tabs)/settings")}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.button} onPress={() => router.replace("/(tabs)/history")}>
          <Text style={styles.buttonText}>View Saved History</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { flex: 1, justifyContent: "center", padding: 28, gap: 20 },
  title: { fontSize: 24, fontWeight: "700", color: Colors.light.text, textAlign: "center" },
  text: { fontSize: 16, lineHeight: 24, color: Colors.light.textSecondary, textAlign: "center" },
  button: { backgroundColor: Colors.light.accent, padding: 16, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
