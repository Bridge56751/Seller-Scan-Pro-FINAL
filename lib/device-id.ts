import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { randomUUID } from "expo-crypto";

const DEVICE_ID_KEY = "seller_scan_device_id";
const DEVICE_SECRET_KEY = "seller_scan_device_credential";
let pending: Promise<{deviceId:string;key:string}> | undefined;
const read = (key:string) => Platform.OS === "web" ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
const write = (key:string,value:string) => Platform.OS === "web" ? AsyncStorage.setItem(key,value) : SecureStore.setItemAsync(key,value);

export function getDeviceCredentials() {
  if (!pending) pending = (async () => {
    let deviceId = await read(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `dev-${randomUUID()}`;
      await write(DEVICE_ID_KEY,deviceId);
    }
    let key = await read(DEVICE_SECRET_KEY);
    if (!key) {
      key = randomUUID().replace(/-/g,"") + randomUUID().replace(/-/g,"");
      await write(DEVICE_SECRET_KEY,key);
    }
    return {deviceId,key};
  })().catch(() => {pending=undefined;throw new Error("Could not securely save this device’s identity. Please enable device storage and retry.");});
  return pending;
}
export async function getDeviceId() {
  return (await getDeviceCredentials()).deviceId;
}
