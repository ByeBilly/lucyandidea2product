import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { profiles } from "../auth/profile";

/**
 * Lucy Chat Sessions
 * Stores chat conversation sessions for each user
 */
export const lucyChats = pgTable("lucy_chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title"), // Optional chat title (auto-generated or user-defined)
  geminiSessionId: text("gemini_session_id"), // To restore chat context if possible
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type LucyChat = typeof lucyChats.$inferSelect;
export type NewLucyChat = typeof lucyChats.$inferInsert;





