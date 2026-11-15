import { Platform, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

export default function ScanBrandHeader() {
  return (
    <SafeAreaView edges={["top"]} style={styles.header}>
      <Text style={styles.title}>Seller Scan</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: Colors.light.accent, paddingTop: Platform.OS === "web" ? 67 : 0 },
  title: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 10 },
});
