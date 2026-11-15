import { Platform } from "react-native";
import { getApiUrl } from "./query-client";
import { fetch } from "expo/fetch";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { registerDevice, getVerifiedTestStatus } from "./device-client";
import { isPurchaseCancelled } from "@/shared/billing-errors";
import { selectProMonthlyPackage, type ProPaywallPlan } from "@/shared/paywall-plan";

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
      const identity = await registerDevice();
      const appUserID = test ? identity.testCustomerId : identity.customerId;
      if (test) {
        await RC.configure({ apiKey, appUserID });
      } else {
        // Preserve an existing anonymous native purchaser, then let RevenueCat alias it
        // into this server-issued ID. This is SDK identity linking, not a user login.
        await RC.configure({ apiKey });
        if (await RC.getAppUserID() !== appUserID) await RC.logIn(appUserID);
      }
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

export async function loadProPaywallPlan(): Promise<ProPaywallPlan> {
  if (!await configureRevenueCat()) throw new Error(configurationError);
  if (Platform.OS !== "ios" && !isTestStore) throw new Error("Subscriptions are available in the iPhone app.");
  const monthly = selectProMonthlyPackage(await Purchases.getOfferings(), isTestStore);
  return { productId: monthly.product.identifier, price: monthly.product.priceString,
    period: "month", mode: isTestStore ? "test" : "native" };
}

let nativePurchaseInFlight = false;
export async function purchaseSubscription(expectedProductId?: string): Promise<{ success: boolean; error?: string }> {
  if (nativePurchaseInFlight) return { success: false, error: "A purchase is already in progress." };
  nativePurchaseInFlight = true;
  try {
  if (!await configureRevenueCat()) return { success: false, error: configurationError };
  if (isTestStore) return { success: false, error: "This preview uses simulated purchases, not the App Store." };
  if (Platform.OS !== "ios") return { success: false, error: "Subscriptions are available in the iPhone app." };
  const RC = await loadPurchasesModule();
  if (!RC || !isConfigured) {
    return { success: false, error: "RevenueCat not configured" };
  }

    const offerings = await RC.getOfferings();
    const monthly = selectProMonthlyPackage(offerings, false);
    if (expectedProductId && monthly.product.identifier !== expectedProductId) {
      return { success: false, error: "The plan has changed. Reload pricing before subscribing." };
    }
    await RC.purchasePackage(monthly);
    // Completion is not proof of entitlement: AuthProvider verifies on our server.
    return { success: true };
  } catch (e: any) {
    if (isPurchaseCancelled(e)) {
      return { success: false, error: "cancelled" };
    }
    return { success: false, error: e.message || "Purchase failed" };
  } finally { nativePurchaseInFlight = false; }
}

export async function restorePurchases(): Promise<{ success: boolean; isPro: boolean; error?: string }> {
  if (!await configureRevenueCat()) return { success: false, isPro: false, error: configurationError };
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
  customerId: string;
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

async function testState(monthly: any): Promise<BillingTestState> {
  const access = await getVerifiedTestStatus();
  return {
    productTitle: monthly.product.title,
    price: monthly.product.priceString,
    productIdentifier: monthly.product.identifier,
    hasTestAccess: access.hasTestAccess,
    expirationDate: access.expirationDate,
    customerId: access.customerId,
  };
}

export async function loadBillingTest(): Promise<BillingTestState> {
  const RC = await testStore();
  const monthly = await testPackage(RC);
  return testState(monthly);
}

let testPurchaseInFlight = false;
export async function purchaseBillingTest(): Promise<{ cancelled: boolean; state: BillingTestState }> {
  if (testPurchaseInFlight) throw new Error("A test purchase is already in progress.");
  testPurchaseInFlight = true;
  try {
    const RC = await testStore();
    const monthly = await testPackage(RC);
    try {
      await RC.purchasePackage(monthly);
      return { cancelled: false, state: await testState(monthly) };
    } catch (error: any) {
      if (isPurchaseCancelled(error)) return { cancelled: true, state: await testState(monthly) };
      throw new Error(typeof error?.message === "string" ? error.message : "The test purchase failed. No production access was unlocked.");
    }
  } finally { testPurchaseInFlight = false; }
}

export async function restoreBillingTest(): Promise<BillingTestState> {
  const RC = await testStore();
  const monthly = await testPackage(RC);
  await RC.restorePurchases();
  return testState(monthly);
}
