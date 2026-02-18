import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  appleUserId: text("apple_user_id").notNull().unique(),
  email: text("email"),
  fullName: text("full_name"),
  sessionToken: text("session_token"),
  deviceId: text("device_id"),
  isGuest: boolean("is_guest").default(false),
  isPaid: boolean("is_paid").default(false),
  scanCount: integer("scan_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at").defaultNow(),
});

export const deviceScans = pgTable("device_scans", {
  deviceId: text("device_id").primaryKey(),
  scanCount: integer("scan_count").default(0),
  firstSeen: timestamp("first_seen").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow(),
});

export type DeviceScan = typeof deviceScans.$inferSelect;
