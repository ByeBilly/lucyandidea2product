import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { profiles } from "../auth/profile";
import { lucyChats } from "./lucy-chats";

/**
 * Lucy Generated Assets
 * Stores images, videos, and audio generated through Lucy
 */
export const lucyAssets = pgTable("lucy_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  chatId: uuid("chat_id")
    .references(() => lucyChats.id, { onDelete: "set null" }), // Optional - asset may outlive chat
  type: text("type").notNull(), // 'image' | 'video' | 'audio'
  url: text("url"), // Public URL for the asset
  storageKey: text("storage_key"), // Supabase storage key for deletion
  prompt: text("prompt"), // The prompt used to generate
  cost: integer("cost").notNull(), // Credits spent
  model: text("model").notNull(), // Gemini model used
  width: integer("width"), // Image/video width
  height: integer("height"), // Image/video height
  duration: integer("duration"), // Video/audio duration in seconds
  mimeType: text("mime_type"), // Content type
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("lucy_asset_user_id_idx").on(table.userId),
  index("lucy_asset_chat_id_idx").on(table.chatId),
  index("lucy_asset_type_idx").on(table.type),
  index("lucy_asset_created_at_idx").on(table.createdAt),
]);

export type LucyAsset = typeof lucyAssets.$inferSelect;
export type NewLucyAsset = typeof lucyAssets.$inferInsert;





