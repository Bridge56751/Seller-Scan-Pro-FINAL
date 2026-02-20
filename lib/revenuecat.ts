import { Platform } from "react-native";
import { getApiUrl } from "./query-client";
import { fetch } from "expo/fetch";

let Purchases: any = null;
let isConfigured = false;

async function loadPurchasesModule() {
  if (Purchases) return Purchases;
  try {
    const mod = await import("react-native-purchases");
    Purchases = mod.default;
    return Purchases;
  } catch {
    return null;
  }
}

async function fetchApiKey(): Promise<string | null> {
  try {
    const baseUrl = getApiUrl();
    const url = new URL("/api/config/revenuecat", baseUrl);
    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      return data.apiKey || null;
    }
  } catch {}
  return null;
}

export async function configureRevenueCat(): Promise<boolean> {
  if (isConfigured) return true;

  const RC = await loadPurchasesModule();
  if (!RC) return false;

  const apiKey = await fetchApiKey();
  if (!apiKey) return false;

  try {
    if (Platform.OS === "web") {
      await RC.configure({ apiKey });
    } else {
      await RC.configure({ apiKey });
    }
    isConfigured = true;
    return true;
  } catch {
    return false;
  }
}

function hasProAccess(customerInfo: any): boolean {
  const entitlements = customerInfo.entitlements?.active || {};
  if (entitlements["Seller Scan Pro"] || entitlements["200"] || entitlements["pro"] || entitlements["Pro"]) {
    return true;
  }
  const activeSubs: string[] = customerInfo.activeSubscriptions || [];
  if (activeSubs.length > 0) {
    return true;
  }
  return false;
}

export async function checkSubscriptionStatus(): Promise<boolean> {
  const RC = await loadPurchasesModule();
  if (!RC || !isConfigured) return false;

  try {
    const customerInfo = await RC.getCustomerInfo();
    return hasProAccess(customerInfo);
  } catch {
    return false;
  }
}

export async function purchaseSubscription(): Promise<{ success: boolean; error?: string }> {
  const RC = await loadPurchasesModule();
  if (!RC || !isConfigured) {
    return { success: false, error: "RevenueCat not configured" };
  }

  try {
    const offerings = await RC.getOfferings();
    const currentOffering = offerings.current;

    if (!currentOffering) {
      return { success: false, error: "No offerings available" };
    }

    const monthly = currentOffering.monthly || currentOffering.availablePackages[0];
    if (!monthly) {
      return { success: false, error: "No subscription package found" };
    }

    const { customerInfo } = await RC.purchasePackage(monthly);
    return { success: hasProAccess(customerInfo) };
  } catch (e: any) {
    if (e.userCancelled) {
      return { success: false, error: "cancelled" };
    }
    return { success: false, error: e.message || "Purchase failed" };
  }
}

export async function restorePurchases(): Promise<{ success: boolean; isPro: boolean; error?: string }> {
  const RC = await loadPurchasesModule();
  if (!RC || !isConfigured) {
    return { success: false, isPro: false, error: "RevenueCat not configured" };
  }

  try {
    const customerInfo = await RC.restorePurchases();
    const isPro = hasProAccess(customerInfo);
    return { success: true, isPro };
  } catch (e: any) {
    return { success: false, isPro: false, error: e.message || "Restore failed" };
  }
}

export async function getOfferings(): Promise<any> {
  const RC = await loadPurchasesModule();
  if (!RC || !isConfigured) return null;

  try {
    return await RC.getOfferings();
  } catch {
    return null;
  }
}
