import { Client } from "pg";
import { readFile } from "node:fs/promises";

const db = new Client({ connectionString: process.env.SUPABASE_DATABASE_URL });
async function main() {
  if (!process.env.SUPABASE_DATABASE_URL) throw new Error("Database not configured");
  await db.connect();
  try {
    await db.query(await readFile("migrations/shared-free-scans.sql", "utf8"));
    console.log("Shared successful-scan allowance ready.");
  } finally { await db.end(); }
}
main().catch(() => { console.error("Shared scan allowance setup failed."); process.exitCode = 1; });
