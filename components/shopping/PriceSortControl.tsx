import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { PriceSort } from "@/shared/offer-sorting";

export default function PriceSortControl({ value, onChange }: {
  value: PriceSort; onChange: (value: PriceSort) => void;
}) {
  return <View style={styles.container}>
    <Text style={styles.label}>Sort results</Text>
    <View style={styles.options}>
      {(["accurate", "low", "high"] as const).map(option => <Pressable
        key={option} accessibilityRole="button"
        accessibilityLabel={option === "accurate" ? "Most accurate" : option === "low" ? "Price: Low to High" : "Price: High to Low"}
        accessibilityState={{ selected: value === option }}
        onPress={() => onChange(option)}
        style={[styles.option, value === option && styles.selected]}
      ><Text style={[styles.text, value === option && styles.selectedText]}>
        {option === "accurate" ? "Most accurate" : option === "low" ? "Low to High" : "High to Low"}
      </Text></Pressable>)}
    </View>
  </View>;
}
const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 12, fontWeight: "600", color: Colors.light.textSecondary },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 9, borderWidth: 1, borderColor: Colors.light.border, backgroundColor: Colors.light.surface },
  selected: { borderColor: Colors.light.accent, backgroundColor: Colors.light.accentDim },
  text: { fontSize: 13, color: Colors.light.textSecondary },
  selectedText: { color: Colors.light.accent, fontWeight: "600" },
});
