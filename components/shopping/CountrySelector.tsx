import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COUNTRIES, countryInfo } from "@/shared/shopping";
import { shoppingStyles as styles } from "./styles";
import Colors from "@/constants/colors";

export default function CountrySelector({ value, onChange, disabled = false }: {
  value: string; onChange: (value: string) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const info = countryInfo(value);
  return <View style={styles.section}>
    <Text style={styles.label}>Shopping country</Text>
    <Pressable accessibilityRole="button" disabled={disabled} style={styles.card} onPress={() => setOpen(true)}>
      <Text style={styles.label}>{info?.[1] || `Unavailable region (${value || "not selected"})`} · Change</Text>
    </Pressable>
    <Text style={styles.text}>Find stores and prices for your country. Coverage varies by region.</Text>
    {!info && <Text style={styles.error}>Shopping comparisons are unavailable for this country. Choose a supported shopping destination to continue.</Text>}
    <Modal visible={open} onRequestClose={() => setOpen(false)} animationType="slide">
      <SafeAreaView style={{ flex: 1, padding: 24, backgroundColor: Colors.light.background, gap: 16 }}>
        <Text style={styles.title}>Choose shopping country</Text>
        <TextInput accessibilityLabel="Find country" placeholder="Country name or code" placeholderTextColor={Colors.light.textSecondary} value={filter} onChangeText={setFilter} style={styles.input} />
        <ScrollView contentContainerStyle={{ gap: 8 }}>
          {COUNTRIES.filter(([code, name]) => `${code} ${name}`.toLowerCase().includes(filter.toLowerCase())).map(([code, name, currency]) =>
            <Pressable key={code} accessibilityRole="button" style={styles.card} onPress={() => { onChange(code); setOpen(false); setFilter(""); }}>
              <Text style={styles.label}>{name} ({currency})</Text>
            </Pressable>)}
          <Text style={styles.text}>Country missing? Coverage is not available here yet.</Text>
          <Pressable accessibilityRole="button" style={styles.card} onPress={() => { onChange("ZZ"); setOpen(false); }}>
            <Text style={styles.label}>My country is not supported</Text>
          </Pressable>
        </ScrollView>
        <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={styles.button}><Text style={styles.buttonText}>Close</Text></Pressable>
      </SafeAreaView>
    </Modal>
  </View>;
}
