import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { deviceScans } from "@shared/schema";
import { Pool, neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

export interface IStorage {
  getDeviceScanCount(deviceId: string): Promise<number>;
  incrementDeviceScanCount(deviceId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getDeviceScanCount(deviceId: string): Promise<number> {
    const [row] = await db.select({ scanCount: deviceScans.scanCount }).from(deviceScans).where(eq(deviceScans.deviceId, deviceId));
    return row?.scanCount ?? 0;
  }

  async incrementDeviceScanCount(deviceId: string): Promise<number> {
    const [existing] = await db.select().from(deviceScans).where(eq(deviceScans.deviceId, deviceId));
    if (existing) {
      const [result] = await db
        .update(deviceScans)
        .set({ scanCount: sql`${deviceScans.scanCount} + 1`, lastSeen: new Date() })
        .where(eq(deviceScans.deviceId, deviceId))
        .returning({ scanCount: deviceScans.scanCount });
      return result?.scanCount ?? 0;
    } else {
      await db.insert(deviceScans).values({ deviceId, scanCount: 1 });
      return 1;
    }
  }
}

export const storage = new DatabaseStorage();
