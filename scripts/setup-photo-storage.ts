import { PHOTO_BUCKET, storageRequest } from "../server/services/photo-store";

async function main() {
  // Explicit setup only; never change bucket configuration during a scan.
  const response = await storageRequest("/bucket");
  const buckets = await response.json() as { id: string; public: boolean }[];
  const existing = buckets.find(bucket => bucket.id === PHOTO_BUCKET);
  if (existing?.public) throw new Error("Photo bucket must be private; refusing to use a public bucket.");
  if (!existing) {
    await storageRequest("/bucket", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: PHOTO_BUCKET, name: PHOTO_BUCKET, public: false,
        file_size_limit: 4 * 1024 * 1024, allowed_mime_types: ["image/jpeg"] }),
    });
  }
  console.log("Private temporary photo bucket ready.");
}
main().catch(() => { console.error("Could not configure private photo storage. Check the server key and project."); process.exitCode = 1; });
