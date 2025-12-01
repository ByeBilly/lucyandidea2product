import { pgTable, uuid, text, timestamp, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { lucyChats } from "./lucy-chats";

/**
 * Lucy Chat Messages
 * Stores individual messages within a chat session
 * 
 * Attachments JSONB structure:
 * { data: string (base64 or URL), mimeType: string, type: 'image' | 'audio' }[]
 * 
 * Tool Calls JSONB structure:
 * { name: string, args: Record<string, any> }[]
 * 
 * Tool Response JSONB structure:
 * { name: string, result: any, error?: string }
 */
export const lucyMessages = pgTable("lucy_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => lucyChats.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'model'
  content: text("content"), // Text content of the message
  attachments: jsonb("attachments"), // User-uploaded files
  toolCalls: jsonb("tool_calls"), // AI tool invocations
  toolResponse: jsonb("tool_response"), // Results from tool execution
  isError: boolean("is_error").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("lucy_message_chat_id_idx").on(table.chatId),
  index("lucy_message_created_at_idx").on(table.createdAt),
]);

export type LucyMessage = typeof lucyMessages.$inferSelect;
export type NewLucyMessage = typeof lucyMessages.$inferInsert;





