export type ScanAccessStatus = { isPaid: boolean; hasTestScanAccess: boolean };
export function hasVerifiedScanAccess(status: ScanAccessStatus) {
  return status.isPaid || status.hasTestScanAccess;
}

// RevenueCat can take a moment to expose a just-completed purchase through REST.
// Retry verification only, never purchase again or infer access from SDK success.
export async function confirmPurchaseAccess<T extends ScanAccessStatus>(
  read: () => Promise<T>,
  wait: (ms: number) => Promise<void> = ms => new Promise(resolve => setTimeout(resolve, ms)),
): Promise<T> {
  let latest: T | undefined;
  let error: unknown;
  for (const delay of [0, 1000, 2000]) {
    if (delay) await wait(delay);
    try {
      latest = await read();
      error = undefined;
      if (hasVerifiedScanAccess(latest)) return latest;
    } catch (cause) { error = cause; }
  }
  if (error) throw error;
  if (!latest) throw new Error("Purchase verification is unavailable.");
  return latest;
}
