import * as SecureStore from "expo-secure-store";

const DEVICE_ID_KEY = "seller_scan_device_id";

let cachedDeviceId: string | null = null;

function generateDeviceId(): string {
  return "dev-" + Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 12) + "-" + Math.random().toString(36).substr(2, 12);
}

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;

  try {
    const stored = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (stored) {
      cachedDeviceId = stored;
      return stored;
    }
  } catch {}

  const newId = generateDeviceId();
  try {
    await SecureStore.setItemAsync(DEVICE_ID_KEY, newId);
  } catch {}

  cachedDeviceId = newId;
  return newId;
}
