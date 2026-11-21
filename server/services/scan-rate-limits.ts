import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { verifyScanAccess, approvedTestIdentity } from "./scan-access";

const pool = new Pool({ connectionString: process.env.SUPABASE_DATABASE_URL, max: 4,
  connectionTimeoutMillis: 10000, query_timeout: 10000, statement_timeout: 10000 });
export class ScanLimitError extends Error {
  constructor(public status: number, public code: string, message: string, public retryAfter = 0) {
    super(message);
  }
}

/**
 * A row lock serializes all reservations for a customer, even across replicas.
 * One initial photo/barcode lookup includes one single-use follow-up price search.
 * Attempts count toward abuse limits; only successful results use the free allowance.
 */
export async function reserveScan(customerId: string, issuePermit = false, permit?: string,
  kind: "photo" | "barcode" | "search" = "search") {
  if (!process.env.SUPABASE_DATABASE_URL) throw new Error("Scan limits unavailable");
  // A follow-up permit was already authorized and counted. All new attempts use
  // server-verified access (Apple production/sandbox, or approved dev Test Store),
  // normally served from the five-minute cache.
  let hasScanAccess = false;
  let testOnly = false;
  if (!permit) {
    try {
      const access = await verifyScanAccess(customerId);
      hasScanAccess = access.isPaid || access.hasTestScanAccess;
      // Only simulated Test Store permits require the development allowlist.
      // Apple's verified sandbox purchases follow the normal authenticated,
      // single-use permit path, with identical monthly and minute limits.
      testOnly = access.hasTestScanAccess && !access.isPaid && !access.hasAppleSandboxAccess;
    }
    catch { throw new ScanLimitError(503,"BILLING_UNAVAILABLE",
      "Subscription verification is temporarily unavailable. No scan was used. Please retry."); }
  }
  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    await db.query(`INSERT INTO customer_scan_limits(customer_id,month_start)
      VALUES($1,date_trunc('month',CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
      ON CONFLICT DO NOTHING`, [customerId]);
    await db.query("SELECT customer_id FROM customer_scan_limits WHERE customer_id=$1 FOR UPDATE", [customerId]);
    if (permit) {
      if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(permit))
        throw new ScanLimitError(409, "INVALID_SCAN_PERMIT", "This scan's price lookup is no longer available. Please retry.");
      const candidate = await db.query("SELECT test_only FROM scan_search_permits WHERE id=$1 AND customer_id=$2",[permit,customerId]);
      const allowTest = candidate.rows[0]?.test_only ? !!await approvedTestIdentity(customerId) : false;
      const claimed = await db.query(`UPDATE scan_search_permits SET used=true
        WHERE id=$1 AND customer_id=$2 AND NOT used AND expires_at>clock_timestamp()
        AND (NOT test_only OR $3) RETURNING id`, [permit,customerId,allowTest]);
      if (!claimed.rowCount)
        throw new ScanLimitError(409, "INVALID_SCAN_PERMIT", "This scan's price lookup has expired or was already used. Please retry.");
      const reservation = await db.query("SELECT id FROM free_scan_reservations WHERE id=$1 AND customer_id=$2", [permit,customerId]);
      await db.query("COMMIT");
      return { scanPermit: undefined, reservationId: reservation.rows[0]?.id as string | undefined };
    }
    // Use the database clock after acquiring the lock, not the app server clock.
    const result = await db.query(`SELECT monthly_count, month_start, free_successful_scans,
      ARRAY(SELECT stamp FROM unnest(recent_scans) stamp
        WHERE stamp>clock_timestamp()-interval '1 minute' ORDER BY stamp) AS recent,
      clock_timestamp() AS now,
      date_trunc('month',clock_timestamp() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' AS month
      FROM customer_scan_limits WHERE customer_id=$1`, [customerId]);
    const row = result.rows[0];
    const now = new Date(row.now).getTime();
    const month = new Date(row.month);
    const used = new Date(row.month_start).getTime() === month.getTime() ? row.monthly_count : 0;
    const recent: Date[] = row.recent;
    await db.query("DELETE FROM free_scan_reservations WHERE customer_id=$1 AND expires_at<=clock_timestamp()", [customerId]);
    const pending = await db.query("SELECT count(*)::int AS count FROM free_scan_reservations WHERE customer_id=$1", [customerId]);
    if (!hasScanAccess && (kind === "search" || row.free_successful_scans >= 5)) {
      throw new ScanLimitError(402, "SUBSCRIPTION_REQUIRED",
        kind === "search" ? "Additional price searches require an active subscription. Each free scan includes one price lookup." :
          "You've used your five free scans. Upgrade to Seller Scan Pro to keep scanning, or restore an existing purchase in Settings.");
    }
    if (!hasScanAccess && row.free_successful_scans + pending.rows[0].count >= 5)
      throw new ScanLimitError(409, "SCAN_IN_PROGRESS", "Please wait for your current scans to finish before starting another.");
    if (used >= 1000) {
      const reset = Date.UTC(month.getUTCFullYear(), month.getUTCMonth()+1, 1);
      throw new ScanLimitError(429, "MONTHLY_SCAN_LIMIT",
        `You’ve reached 1,000 scans this month. Your limit resets ${new Date(reset).toISOString().slice(0,10)} (UTC).`,
        Math.max(1, Math.ceil((reset-now)/1000)));
    }
    if (recent.length >= 10) {
      const seconds = Math.max(1, Math.ceil((new Date(recent[0]).getTime()+60000-now)/1000));
      throw new ScanLimitError(429, "MINUTE_SCAN_LIMIT",
        `You’ve reached 10 scans in a minute. Please try again in ${seconds} seconds.`, seconds);
    }
    await db.query(`UPDATE customer_scan_limits SET month_start=$2, monthly_count=$3,
      recent_scans=$4::timestamptz[], total_scans=total_scans+1,
      free_photo_used=free_photo_used OR $5,
      free_barcode_used=free_barcode_used OR $6 WHERE customer_id=$1`,
    [customerId,month,used+1,[...recent,new Date(now)],!hasScanAccess && kind==="photo",!hasScanAccess && kind==="barcode"]);
    const reservationId = !hasScanAccess ? randomUUID() : undefined;
    const scanPermit = issuePermit ? reservationId ?? randomUUID() : undefined;
    if (reservationId) await db.query(`INSERT INTO free_scan_reservations(id,customer_id,expires_at)
      VALUES($1,$2,clock_timestamp()+interval '5 minutes')`, [reservationId,customerId]);
    if (scanPermit) {
      await db.query(`INSERT INTO scan_search_permits(id,customer_id,expires_at,test_only)
        VALUES($1,$2,clock_timestamp()+interval '5 minutes',$3)`, [scanPermit,customerId,testOnly]);
    }
    await db.query("DELETE FROM scan_search_permits WHERE customer_id=$1 AND expires_at<=clock_timestamp()", [customerId]);
    await db.query("COMMIT");
    return { scanPermit, reservationId };
  } catch (error) {
    await db.query("ROLLBACK").catch(() => {});
    throw error;
  } finally { db.release(); }
}

export async function scanAllowances(customerId: string) {
  const result = await pool.query(`SELECT free_successful_scans,total_scans
    FROM customer_scan_limits WHERE customer_id=$1`,[customerId]);
  const row = result.rows[0];
  return {
    freeScansLeft: Math.max(0, 5 - (row?.free_successful_scans ?? 0)),
    freePhotoScansLeft: Math.max(0, 5 - (row?.free_successful_scans ?? 0)),
    freeBarcodeScansLeft: Math.max(0, 5 - (row?.free_successful_scans ?? 0)),
    scanCount: row?.total_scans ?? 0,
  };
}

// Called only by server routes after provider results, never by a client-reported success.
export async function finishFreeScan(customerId: string, id: string | undefined, success: boolean) {
  if (!id) return;
  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    await db.query("SELECT customer_id FROM customer_scan_limits WHERE customer_id=$1 FOR UPDATE", [customerId]);
    const claimed = await db.query(`DELETE FROM free_scan_reservations
      WHERE id=$1 AND customer_id=$2 RETURNING expires_at>clock_timestamp() AS valid`, [id,customerId]);
    if (!success) await db.query("DELETE FROM scan_search_permits WHERE id=$1 AND customer_id=$2", [id,customerId]);
    if (success) {
      if (!claimed.rows[0]?.valid) throw new ScanLimitError(409, "SCAN_EXPIRED", "This scan expired. Please try again.");
      await db.query("UPDATE customer_scan_limits SET free_successful_scans=free_successful_scans+1 WHERE customer_id=$1", [customerId]);
    }
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK").catch(() => {});
    throw error;
  } finally { db.release(); }
}
