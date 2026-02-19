import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { Platform } from "react-native";
import { getApiUrl } from "./query-client";
import { fetch } from "expo/fetch";
import { getDeviceId } from "./device-id";
import { configureRevenueCat, checkSubscriptionStatus, restorePurchases as rcRestorePurchases, purchaseSubscription as rcPurchaseSubscription } from "./revenuecat";

const FREE_SCAN_LIMIT = 5;

interface DeviceState {
  deviceId: string;
  isPaid: boolean;
  scanCount: number;
  freeScansLeft: number;
}

interface AuthContextValue {
  device: DeviceState | null;
  isLoading: boolean;
  isReady: boolean;
  isPaid: boolean;
  scanCount: number;
  freeScansLeft: number;
  recordScan: () => Promise<{ allowed: boolean; freeScansLeft: number }>;
  refreshDevice: () => Promise<void>;
  setPaid: (paid: boolean) => void;
  purchaseSubscription: () => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; isPro: boolean; error?: string }>;
  rcReady: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<DeviceState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rcReady, setRcReady] = useState(false);

  useEffect(() => {
    initDevice();
    initRevenueCat();
  }, []);

  async function initRevenueCat() {
    const configured = await configureRevenueCat();
    setRcReady(configured);

    if (configured) {
      const isPro = await checkSubscriptionStatus();
      if (isPro) {
        setDevice((prev) => (prev ? { ...prev, isPaid: true, freeScansLeft: 0 } : prev));
      }
    }
  }

  async function initDevice() {
    try {
      const deviceId = await getDeviceId();
      const baseUrl = getApiUrl();
      const url = new URL("/api/device/status", baseUrl);

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      if (res.ok) {
        const data = await res.json();
        setDevice({
          deviceId,
          isPaid: data.isPaid ?? false,
          scanCount: data.scanCount ?? 0,
          freeScansLeft: data.freeScansLeft ?? FREE_SCAN_LIMIT,
        });
      } else {
        setDevice({
          deviceId,
          isPaid: false,
          scanCount: 0,
          freeScansLeft: FREE_SCAN_LIMIT,
        });
      }
    } catch {
      const deviceId = await getDeviceId();
      setDevice({
        deviceId,
        isPaid: false,
        scanCount: 0,
        freeScansLeft: FREE_SCAN_LIMIT,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const recordScan = useCallback(async (): Promise<{ allowed: boolean; freeScansLeft: number }> => {
    const deviceId = await getDeviceId();
    const baseUrl = getApiUrl();
    const url = new URL("/api/device/record-scan", baseUrl);

    try {
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });

      if (!res.ok) return { allowed: false, freeScansLeft: 0 };

      const data = await res.json();

      setDevice((prev) =>
        prev
          ? { ...prev, scanCount: data.scanCount, freeScansLeft: data.freeScansLeft, isPaid: data.isPaid ?? prev.isPaid }
          : prev,
      );

      return { allowed: data.allowed, freeScansLeft: data.freeScansLeft };
    } catch {
      return { allowed: false, freeScansLeft: 0 };
    }
  }, []);

  const refreshDevice = useCallback(async () => {
    await initDevice();
    if (rcReady) {
      const isPro = await checkSubscriptionStatus();
      if (isPro) {
        setDevice((prev) => (prev ? { ...prev, isPaid: true, freeScansLeft: 0 } : prev));
      }
    }
  }, [rcReady]);

  const setPaid = useCallback((paid: boolean) => {
    setDevice((prev) =>
      prev ? { ...prev, isPaid: paid, freeScansLeft: paid ? 0 : prev.freeScansLeft } : prev,
    );
  }, []);

  const purchaseSubscription = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const result = await rcPurchaseSubscription();
    if (result.success) {
      setDevice((prev) => (prev ? { ...prev, isPaid: true, freeScansLeft: 0 } : prev));
    }
    return result;
  }, []);

  const restorePurchases = useCallback(async (): Promise<{ success: boolean; isPro: boolean; error?: string }> => {
    const result = await rcRestorePurchases();
    if (result.isPro) {
      setDevice((prev) => (prev ? { ...prev, isPaid: true, freeScansLeft: 0 } : prev));
    }
    return result;
  }, []);

  const value = useMemo(
    () => ({
      device,
      isLoading,
      isReady: !!device,
      isPaid: device?.isPaid ?? false,
      scanCount: device?.scanCount ?? 0,
      freeScansLeft: device?.freeScansLeft ?? FREE_SCAN_LIMIT,
      recordScan,
      refreshDevice,
      setPaid,
      purchaseSubscription,
      restorePurchases,
      rcReady,
    }),
    [device, isLoading, recordScan, refreshDevice, setPaid, purchaseSubscription, restorePurchases, rcReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
