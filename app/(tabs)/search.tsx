import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CountrySelector from "@/components/shopping/CountrySelector";
import ShoppingComparison from "@/components/shopping/ShoppingComparison";
import { shoppingStyles as styles } from "@/components/shopping/styles";
import Colors from "@/constants/colors";

export default function SearchScreen() {
  const [country, setCountry] = useState("US");
  const [busy, setBusy] = useState(false);
  return <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
    <ScrollView contentContainerStyle={{ padding: 28, gap: 20 }}>
      <Text style={styles.title}>Compare Shopping Prices</Text>
      <Text style={styles.text}>Know the product already? Enter its exact details without uploading a photo.</Text>
      <CountrySelector value={country} onChange={setCountry} disabled={busy} />
      <ShoppingComparison key={country} country={country} onBusyChange={setBusy} />
    </ScrollView>
  </SafeAreaView>;
}
