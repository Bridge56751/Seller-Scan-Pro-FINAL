import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { users, deviceScans, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { Pool, neonConfig } from "@neondatabase/serverless";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

export interface IStorage {
  getUserByAppleId(appleUserId: string): Promise<User | undefined>;
  getUserBySessionToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser, isGuest?: boolean): Promise<User>;
  updateSessionToken(userId: string, token: string): Promise<void>;
  updateLastLogin(userId: string): Promise<void>;
  incrementScanCount(userId: string): Promise<number>;
  getScanCount(userId: string): Promise<number>;
  setUserPaid(userId: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  getDeviceScanCount(deviceId: string): Promise<number>;
  incrementDeviceScanCount(deviceId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUserByAppleId(appleUserId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.appleUserId, appleUserId));
    return user;
  }

  async getUserBySessionToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.sessionToken, token));
    return user;
  }

  async createUser(insertUser: InsertUser, isGuest = false): Promise<User> {
    const [user] = await db.insert(users).values({ ...insertUser, isGuest }).returning();
    return user;
  }

  async updateSessionToken(userId: string, token: string): Promise<void> {
    await db.update(users).set({ sessionToken: token }).where(eq(users.id, userId));
  }

  async updateLastLogin(userId: string): Promise<void> {
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
  }

  async incrementScanCount(userId: string): Promise<number> {
    const [result] = await db
      .update(users)
      .set({ scanCount: sql`${users.scanCount} + 1` })
      .where(eq(users.id, userId))
      .returning({ scanCount: users.scanCount });
    return result?.scanCount ?? 0;
  }

  async getScanCount(userId: string): Promise<number> {
    const [user] = await db.select({ scanCount: users.scanCount }).from(users).where(eq(users.id, userId));
    return user?.scanCount ?? 0;
  }

  async setUserPaid(userId: string): Promise<void> {
    await db.update(users).set({ isPaid: true }).where(eq(users.id, userId));
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

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
