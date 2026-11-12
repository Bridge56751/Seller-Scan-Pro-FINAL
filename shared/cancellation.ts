/** Portable to React Native, where AbortSignal.throwIfAborted is not universal. */
export function throwIfCanceled(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const error = new Error("Search canceled.");
    error.name = "AbortError";
    throw error;
  }
}
