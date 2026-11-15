import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";

const KEY = "seller_scan_billing_test_identity";
let identity: Promise<string> | undefined;

// Separate from real customers and from the app's device scan allowance.
export function getBillingTestIdentity() {
  if (!identity) {
    identity = (async () => {
      const saved = Platform.OS === "web" ? await AsyncStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
      if (saved) return saved;
      const id = `billing-test-${randomUUID()}`;
      if (Platform.OS === "web") await AsyncStorage.setItem(KEY, id);
      else await SecureStore.setItemAsync(KEY, id);
      return id;
    })().catch(() => { identity = undefined; throw new Error("Could not save this device’s test identity. Enable device storage and retry."); });
  }
  return identity;
}
