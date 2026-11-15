export type VerifiedAccess = { hasAccess: boolean; expirationDate: string | null };

export function subscriptionAccess(
  items: unknown[],
  entitlementId: string,
  environment: "production" | "sandbox",
  now = Date.now(),
): VerifiedAccess {
  const eligible = items.filter((item: any) => item && item.environment === environment && item.gives_access === true &&
    (environment === "production" ? item.store === "app_store" : item.store === "test_store") &&
    Array.isArray(item.entitlements?.items) && item.entitlements.items.some((e: any) => e.id === entitlementId) &&
    typeof item.current_period_ends_at === "number" && item.current_period_ends_at > now &&
    (item.ends_at == null || (typeof item.ends_at === "number" && item.ends_at > now))) as Array<{current_period_ends_at:number}>;
  if (!eligible.length) return { hasAccess: false, expirationDate: null };
  const latest = Math.max(...eligible.map(item => item.current_period_ends_at));
  return { hasAccess: true, expirationDate: new Date(latest).toISOString() };
}
