import { Client } from "pg";
import { readFile } from "node:fs/promises";

async function main() {
  const url = new URL(process.env.SUPABASE_DATABASE_URL || "");
  const project = new URL(process.env.EXPO_PUBLIC_SUPABASE_URL || "").hostname.split(".")[0];
  if ((!url.hostname.endsWith(".supabase.com") && !url.hostname.endsWith(".supabase.co")) ||
    (!url.hostname.includes(project) && !decodeURIComponent(url.username).endsWith(`.${project}`))) {
    throw new Error("Database project mismatch");
  }
  const db = new Client({ connectionString: process.env.SUPABASE_DATABASE_URL });
  try {
    await db.connect();
    await db.query(await readFile("migrations/scan-rate-limits.sql", "utf8"));
    console.log("Customer scan limits ready: 1,000/month and 10/rolling minute.");
  } finally { await db.end(); }
}
main().catch(() => { console.error("Scan limit setup failed; no existing scan history was changed."); process.exitCode=1; });
