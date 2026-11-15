// React Native reports string `code`; the Web/Test Store SDK can report numeric `errorCode`.
export function isPurchaseCancelled(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const value = error as { userCancelled?: boolean; code?: unknown; errorCode?: unknown };
  return value.userCancelled === true || value.code === "1" || value.code === 1 ||
    value.errorCode === "1" || value.errorCode === 1;
}
