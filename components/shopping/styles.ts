import { StyleSheet } from "react-native";
import Colors from "@/constants/colors";

export const shoppingStyles = StyleSheet.create({
  section: { gap: 14 },
  title: { fontSize: 20, fontWeight: "700", color: Colors.light.text },
  text: { fontSize: 15, lineHeight: 22, color: Colors.light.textSecondary },
  label: { fontSize: 15, fontWeight: "600", color: Colors.light.text },
  input: { borderWidth: 1, borderColor: Colors.light.border, borderRadius: 8, padding: 12, color: Colors.light.text, backgroundColor: Colors.light.surface, fontSize: 16 },
  button: { backgroundColor: Colors.light.accent, padding: 16, borderRadius: 8, alignItems: "center", minHeight: 52 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  disabled: { opacity: 0.5 },
  card: { borderWidth: 1, borderColor: Colors.light.border, backgroundColor: Colors.light.surface, padding: 16, borderRadius: 8, gap: 8 },
  selected: { borderColor: Colors.light.accent, borderWidth: 2 },
  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  error: { color: Colors.light.danger, fontSize: 15, lineHeight: 22 },
  link: { color: Colors.light.accent, fontSize: 15, fontWeight: "600", paddingVertical: 8 },
});
