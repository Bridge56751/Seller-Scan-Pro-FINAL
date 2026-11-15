import { ReplitConnectors } from "@replit/connectors-sdk";
import { subscriptionAccess, type VerifiedAccess } from "../../shared/purchase-verification";

const connectors = new ReplitConnectors();
// Cache only briefly; failed verification never creates or extends paid access.
const cached = new Map<string, { until: number; value: VerifiedAccess }>();
export async function verifyRevenueCat(customerId: string, test = false, refresh = false): Promise<VerifiedAccess> {
  if (test && process.env.NODE_ENV !== "development") throw new Error("Test verification unavailable");
  const project = process.env.REVENUECAT_PROJECT_ID;
  const entitlement = process.env.REVENUECAT_PRO_ENTITLEMENT_ID;
  if (!project || !entitlement) throw new Error("Billing verification not configured");
  const environment = test ? "sandbox" : "production";
  const cacheKey = `${environment}:${customerId}`;
  const hit = cached.get(cacheKey);
  if (!refresh && hit && hit.until > Date.now()) return hit.value;
  const root = `/v2/projects/${encodeURIComponent(project)}/customers/${encodeURIComponent(customerId)}/subscriptions`;
  let path: string | null = `${root}?environment=${environment}&limit=100`;
  const subscriptions: unknown[] = [];
  const signal = AbortSignal.timeout(12000);
  for (let pages = 0; path && pages < 10; pages++) {
    const res = await connectors.proxy("revenuecat", path, { method: "GET", signal });
    if (res.status === 404 && pages === 0) return { hasAccess: false, expirationDate: null };
    if (!res.ok) throw new Error("RevenueCat verification unavailable");
    const data = await res.json();
    if (!Array.isArray(data.items)) throw new Error("Invalid billing response");
    subscriptions.push(...data.items);
    path = data.next_page || null;
    if (path && !path.startsWith(root + "?")) throw new Error("Unexpected billing continuation");
  }
  if (path) throw new Error("Billing response exceeded verification limit");
  const value = subscriptionAccess(subscriptions, entitlement, environment);
  if (cached.size >= 1000) cached.delete(cached.keys().next().value!);
  cached.set(cacheKey, { until: Math.min(Date.now() + 15000, value.expirationDate ? Date.parse(value.expirationDate) : Infinity), value });
  return value;
}
