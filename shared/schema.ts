import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  appleUserId: text("apple_user_id").notNull().unique(),
  email: text("email"),
  fullName: text("full_name"),
  sessionToken: text("session_token"),
  isGuest: boolean("is_guest").default(false),
  isPaid: boolean("is_paid").default(false),
  scanCount: integer("scan_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  appleUserId: true,
  email: true,
  fullName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
