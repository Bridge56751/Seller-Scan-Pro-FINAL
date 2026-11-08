import { getApiUrl } from "./query-client";
import { prepareProductPhoto } from "./native-camera";
import { type Identification, type Comparison, type ComparisonInput } from "@/shared/shopping";

async function shoppingRequest<T>(route: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(new URL(`/api/shopping/${route}`, getApiUrl()).href, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || "The shopping service is unavailable. Please try again.");
    if (!data) throw new Error("The shopping service returned an unreadable response.");
    return data as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The search took too long. Please try again.");
    }
    throw error;
  } finally { clearTimeout(timeout); }
}

// Only called for a user-accepted camera photo or an explicit retry.
export async function identifyPhoto(uri: string, country: string) {
  const image = await prepareProductPhoto(uri);
  return shoppingRequest<Identification>("identify", { image, country });
}
export function compareProduct(input: ComparisonInput) {
  return shoppingRequest<Comparison>("compare", input);
}
