import { Client } from "pg";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// Explicit setup only; never execute DDL on startup or against the source database.
const targetUrl = new URL(process.env.SUPABASE_DATABASE_URL || "");
const project = new URL(process.env.EXPO_PUBLIC_SUPABASE_URL || "").hostname.split(".")[0];
if (!targetUrl.hostname.endsWith(".supabase.com") && !targetUrl.hostname.endsWith(".supabase.co")) throw new Error("Unexpected database host");
if (!targetUrl.hostname.includes(project) && !decodeURIComponent(targetUrl.username).endsWith(`.${project}`)) throw new Error("Database project mismatch");
const source = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
const target = new Client({ connectionString: process.env.SUPABASE_DATABASE_URL, connectionTimeoutMillis: 10000 });
async function main() {
try {
  await source.connect();
  await target.connect();
  await target.query(await readFile("migrations/device-customers.sql", "utf8"));
  const old = await source.query("SELECT device_id, scan_count FROM device_scans");
  await target.query("BEGIN");
  for (const row of old.rows) {
    const hash = createHash("sha256").update(row.device_id).digest("hex");
    await target.query(`INSERT INTO legacy_device_allowances(device_hash,scan_count) VALUES($1,$2)
      ON CONFLICT(device_hash) DO UPDATE SET scan_count=GREATEST(legacy_device_allowances.scan_count,excluded.scan_count)`,
    [hash, Math.max(0, row.scan_count || 0)]);
  }
  await target.query("COMMIT");
  console.log(`Device customer storage ready; preserved ${old.rowCount} legacy counters. Source database unchanged.`);
} catch {
  await target.query("ROLLBACK").catch(() => {});
  console.error("Device customer setup failed. No source data was changed.");
  process.exitCode = 1;
} finally { await source.end(); await target.end(); }
}
void main();
