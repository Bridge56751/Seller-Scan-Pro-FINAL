import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import Colors from "@/constants/colors";

export default function ScanAllowance() {
  const { restorePurchases } = useAuth();
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState<string|null>(null);
  async function restore() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await restorePurchases();
      setMessage(result.isPro ? "Your subscription is verified. You can scan again." :
        result.error || "No active subscription was found.");
    } catch { setMessage("Could not restore purchases. Please try again."); }
    finally { setBusy(false); }
  }
  return <SafeAreaView style={styles.screen}>
    <View style={styles.content}>
      <Text style={styles.title}>Your scan allowance</Text>
      <Text style={styles.body}>Each registered customer gets one free photo scan and one free barcode scan, each including its first price lookup.</Text>
      <Text style={styles.body}>After that, an active subscription is required for more scans of that type. Extra price searches and refinements also require a subscription.</Text>
      <Text style={styles.body}>Free scans are one-time allowances, not monthly. Started attempts count even if no match is found or the provider fails. All customers remain limited to 1,000 scans per month and 10 per minute.</Text>
      <Text style={styles.body}>Already subscribed? Restore your purchase below. New subscription purchases are currently paused.</Text>
      {message && <Text accessibilityRole="alert" style={styles.body}>{message}</Text>}
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => void restore()} style={styles.button}>
        {busy ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>Restore Purchases</Text>}
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={styles.link}>Back</Text></Pressable>
    </View>
  </SafeAreaView>;
}
const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:Colors.light.background},content:{padding:24,gap:20},
  title:{fontSize:26,fontWeight:"700",color:Colors.light.text},
  body:{fontSize:15,lineHeight:23,color:Colors.light.textSecondary},
  button:{backgroundColor:Colors.light.accent,padding:16,borderRadius:12,alignItems:"center"},
  buttonText:{color:"#fff",fontWeight:"700"},link:{color:Colors.light.accent,textAlign:"center",padding:12},
});
