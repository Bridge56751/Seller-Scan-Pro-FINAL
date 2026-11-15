import { randomUUID } from "node:crypto";

export const PHOTO_BUCKET = "temporary-scan-photos";
const TTL_SECONDS = 120;

// The secret stays on the server. Never include provider errors or signed links in logs.
export async function storageRequest(path: string, init: RequestInit = {}) {
  const origin = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!origin || !key) throw new Error("Private photo storage is not configured");
  const response = await fetch(`${origin}/storage/v1${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, ...init.headers },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Private photo storage failed (${response.status})`);
  return response;
}

export async function storePhoto(bytes: Buffer) {
  const id = `${Date.now()}-${randomUUID()}.jpg`;
  try {
    await storageRequest(`/object/${PHOTO_BUCKET}/${id}`, {
      method: "POST", headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" },
      body: new Uint8Array(bytes),
    });
    const response = await storageRequest(`/object/sign/${PHOTO_BUCKET}/${id}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: TTL_SECONDS }),
    });
    const data = await response.json();
    if (typeof data.signedURL !== "string" || !data.signedURL.startsWith("/object/sign/")) {
      throw new Error("Invalid photo link");
    }
    return { id, url: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1${data.signedURL}` };
  } catch (error) {
    await deletePhoto(id).catch(() => {});
    throw error;
  }
}

export async function deletePhoto(id: string) {
  await storageRequest(`/object/${PHOTO_BUCKET}`, {
    method: "DELETE", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: [id] }),
  });
}

// Persistent object names let any replica recover cleanup after crashes/restarts.
// Only this dedicated bucket is touched; customer History is never deleted.
let cleaning = false;
export async function cleanupPhotos() {
  if (cleaning) return;
  cleaning = true;
  try {
    for (let page = 0; page < 10; page++) {
      const response = await storageRequest(`/object/list/${PHOTO_BUCKET}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: "", limit: 100, offset: 0, sortBy: { column: "name", order: "asc" } }),
      });
      const objects = await response.json() as { name: string }[];
      const expired = objects.filter(object => /^\d{13}-[\da-f-]+\.jpg$/.test(object.name) &&
        Number(object.name.slice(0, 13)) < Date.now() - TTL_SECONDS * 1000).map(object => object.name);
      if (!expired.length) break;
      await storageRequest(`/object/${PHOTO_BUCKET}`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefixes: expired }),
      });
      if (objects.length < 100) break;
    }
  } finally { cleaning = false; }
}

export function startPhotoCleanup() {
  const run = () => void cleanupPhotos().catch(() =>
    console.warn("[Shopping] Temporary photo cleanup delayed; signed links expire automatically."));
  run();
  const timer = setInterval(run, 60000);
  timer.unref();
}
