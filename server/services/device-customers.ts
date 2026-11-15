import { Pool } from "pg";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { Request } from "express";

const pool = new Pool({ connectionString: process.env.SUPABASE_DATABASE_URL, max: 4,
  connectionTimeoutMillis: 10000, query_timeout: 10000, statement_timeout: 10000 });
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const credentials = z.object({
  deviceId: z.string().regex(/^[a-zA-Z0-9_-]{12,160}$/),
  key: z.string().regex(/^[a-f0-9]{64}$/),
});
export type DeviceCustomer = { device_hash: string; customer_id: string; test_customer_id: string; scan_count: number };
export class DeviceError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function readDeviceCredentials(req: Request) {
  const parsed = credentials.safeParse({ deviceId: req.get("x-device-id"), key: req.get("x-device-key") });
  if (!parsed.success) throw new DeviceError(401, "This device could not be authenticated. Reopen the app and retry.");
  return parsed.data;
}
export async function authenticateDevice(req: Request, register = false): Promise<DeviceCustomer> {
  if (!process.env.SUPABASE_DATABASE_URL) throw new DeviceError(503, "Device storage is unavailable.");
  const input = readDeviceCredentials(req);
  const deviceHash = hash(input.deviceId);
  const keyHash = hash(input.key);
  if (register) {
    await pool.query(`INSERT INTO device_customers(device_hash,credential_hash,customer_id,test_customer_id,scan_count)
      VALUES($1,$2,$3,$4,COALESCE((SELECT scan_count FROM legacy_device_allowances WHERE device_hash=$1),0))
      ON CONFLICT(device_hash) DO NOTHING`,
    [deviceHash, keyHash, `ss_${randomUUID()}`, `ss_test_${randomUUID()}`]);
  }
  const result = await pool.query("SELECT * FROM device_customers WHERE device_hash=$1", [deviceHash]);
  const row = result.rows[0];
  if (!row || !timingSafeEqual(Buffer.from(row.credential_hash, "hex"), Buffer.from(keyHash, "hex"))) {
    throw new DeviceError(401, "This device’s credentials do not match its registration.");
  }
  return { device_hash: row.device_hash, customer_id: row.customer_id, test_customer_id: row.test_customer_id, scan_count: row.scan_count };
}
export async function recordDeviceScan(device: DeviceCustomer, isPaid: boolean) {
  const result = await pool.query(`UPDATE device_customers SET scan_count=scan_count+1
    WHERE device_hash=$1 AND ($2::boolean OR scan_count<5) RETURNING scan_count`, [device.device_hash,isPaid]);
  return { allowed: !!result.rows[0], scanCount: result.rows[0]?.scan_count ?? device.scan_count };
}
