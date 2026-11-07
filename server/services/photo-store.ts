import { Pool } from "pg";
import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { setInterval } from "node:timers";

// Shared storage makes temporary links work across backend replicas.
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
const TTL_MS = 120000;

export async function storePhoto(bytes: Buffer) {
  const id = randomBytes(16).toString("hex");
  const key = randomBytes(32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
  const payload = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64");
  await pool.query("DELETE FROM shopping_photos WHERE expires_at <= NOW()");
  await pool.query("INSERT INTO shopping_photos (id, payload, expires_at) VALUES ($1, $2, $3)",
    [id, payload, new Date(Date.now() + TTL_MS)]);
  // Encryption key exists only in the unguessable short-lived capability URL, not the database.
  return { id, token: `${id}.${key.toString("hex")}` };
}

export async function readPhoto(token: string): Promise<Buffer | null> {
  if (!/^[a-f0-9]{32}\.[a-f0-9]{64}$/.test(token)) return null;
  const [id, key] = token.split(".");
  const result = await pool.query("SELECT payload FROM shopping_photos WHERE id = $1 AND expires_at > NOW()", [id]);
  if (!result.rows[0]) return null;
  try {
    const payload = Buffer.from(result.rows[0].payload, "base64");
    const decipher = createDecipheriv("aes-256-gcm", Buffer.from(key, "hex"), payload.subarray(0, 12));
    decipher.setAuthTag(payload.subarray(12, 28));
    return Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]);
  } catch { return null; }
}

export async function deletePhoto(id: string) {
  await pool.query("DELETE FROM shopping_photos WHERE id = $1", [id]);
}

const cleanup = setInterval(() => {
  pool.query("DELETE FROM shopping_photos WHERE expires_at <= NOW()")
    .catch(() => console.warn("[Shopping] Temporary photo cleanup failed; expired links remain inaccessible."));
}, 60000);
(cleanup as unknown as NodeJS.Timeout).unref();
