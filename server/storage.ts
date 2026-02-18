import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { users, type User, type InsertUser } from "@shared/schema";
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
  createUser(user: InsertUser): Promise<User>;
  updateSessionToken(userId: string, token: string): Promise<void>;
  updateLastLogin(userId: string): Promise<void>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateSessionToken(userId: string, token: string): Promise<void> {
    await db.update(users).set({ sessionToken: token }).where(eq(users.id, userId));
  }

  async updateLastLogin(userId: string): Promise<void> {
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
