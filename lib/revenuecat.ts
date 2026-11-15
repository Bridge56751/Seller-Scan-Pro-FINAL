import { Platform } from "react-native";
import { getApiUrl } from "./query-client";
import { fetch } from "expo/fetch";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { getBillingTestIdentity } from "./billing-test-identity";
import { isPurchaseCancelled } from "@/shared/billing-errors";

let Purchases: any = null;
let isConfigured = false;
let isTestStore = false;
let configuration: Promise<boolean> | null = null;
let configurationError = "RevenueCat is not configured.";

function wantsTestStore() {
  return __DEV__ && (Platform.OS === "web" || Constants.executionEnvironment === ExecutionEnvironment.StoreClient);
}

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

async function fetchApiKey(test: boolean): Promise<string> {
  const url = new URL("/api/config/revenuecat", getApiUrl());
  if (test) url.searchParams.set("mode", "test");
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Billing configuration is unavailable.");
  if (test && (data.mode !== "test" || !data.apiKey?.startsWith("test_"))) throw new Error("Test billing requires a Test Store key. Native purchases have not been enabled.");
  if (!test && !/^(appl_|goog_|amzn_)/.test(data.apiKey || "")) throw new Error("Native billing requires a native store key.");
  return data.apiKey;
}

export async function configureRevenueCat(): Promise<boolean> {
  if (isConfigured) return true;
  if (configuration) return configuration;
  const test = wantsTestStore();
  if (Platform.OS === "web" && !test) return false;
  configuration = (async () => {
    try {
      const RC = await loadPurchasesModule();
      if (!RC) throw new Error("The billing SDK could not load.");
      const apiKey = await fetchApiKey(test);
      const appUserID = test ? await getBillingTestIdentity() : undefined;
      await RC.configure({ apiKey, ...(appUserID ? { appUserID } : {}) });
      isTestStore = test;
      isConfigured = true;
      return true;
    } catch (error) {
      configurationError = error instanceof Error ? error.message : "Billing could not connect. Please retry.";
      return false;
    } finally { configuration = null; }
  })();
  return configuration;
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
  // Test transactions never grant production access or modify scan allowances.
  if (isTestStore) return false;
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
  if (isTestStore) return { success: false, error: "Use Settings → Billing Test for simulated purchases. Live subscriptions remain paused." };
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
  if (isTestStore) return { success: false, isPro: false, error: "Use Billing Test to restore test purchases. Real App Store purchases require a native build." };
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

export type BillingTestState = {
  productTitle: string; price: string; productIdentifier: string;
  hasTestAccess: boolean; expirationDate: string | null;
};

async function testStore() {
  if (!wantsTestStore()) throw new Error("Billing tests are available in the development preview or Expo Go only.");
  if (!await configureRevenueCat() || !isTestStore) throw new Error(configurationError);
  return Purchases;
}

async function testPackage(RC: any) {
  const offerings = await RC.getOfferings();
  const monthly = offerings.current?.monthly;
  if (!monthly || offerings.current.identifier !== "200" || monthly.product.identifier !== "monthly") {
    throw new Error("Seller Scan’s Test Store monthly package was not found. Check the Test Store key and offering.");
  }
  return monthly;
}

function testState(monthly: any, customerInfo: any): BillingTestState {
  const access = customerInfo.entitlements?.active?.["Seller Scan Pro"];
  return {
    productTitle: monthly.product.title,
    price: monthly.product.priceString,
    productIdentifier: monthly.product.identifier,
    hasTestAccess: !!access?.isActive,
    expirationDate: access?.expirationDate ?? null,
  };
}

export async function loadBillingTest(): Promise<BillingTestState> {
  const RC = await testStore();
  const [monthly, info] = await Promise.all([testPackage(RC), RC.getCustomerInfo()]);
  return testState(monthly, info);
}

let testPurchaseInFlight = false;
export async function purchaseBillingTest(): Promise<{ cancelled: boolean; state: BillingTestState }> {
  if (testPurchaseInFlight) throw new Error("A test purchase is already in progress.");
  testPurchaseInFlight = true;
  try {
    const RC = await testStore();
    const monthly = await testPackage(RC);
    try {
      const { customerInfo } = await RC.purchasePackage(monthly);
      return { cancelled: false, state: testState(monthly, customerInfo) };
    } catch (error: any) {
      if (isPurchaseCancelled(error)) return { cancelled: true, state: testState(monthly, await RC.getCustomerInfo()) };
      throw new Error(typeof error?.message === "string" ? error.message : "The test purchase failed. No production access was unlocked.");
    }
  } finally { testPurchaseInFlight = false; }
}

export async function restoreBillingTest(): Promise<BillingTestState> {
  const RC = await testStore();
  const monthly = await testPackage(RC);
  return testState(monthly, await RC.restorePurchases());
}
