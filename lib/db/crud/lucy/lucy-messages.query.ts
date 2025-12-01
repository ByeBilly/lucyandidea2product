import { db } from "@/lib/db/drizzle";
import { lucyMessages } from "@/lib/db/schemas/lucy";
import { eq, desc, asc } from "drizzle-orm";

/**
 * Lucy Messages Query Operations
 */
export class LucyMessagesQuery {
  /**
   * Get all messages for a chat
   */
  static async findByChatId(chatId: string) {
    return db
      .select()
      .from(lucyMessages)
      .where(eq(lucyMessages.chatId, chatId))
      .orderBy(asc(lucyMessages.createdAt));
  }

  /**
   * Get a single message by ID
   */
  static async findById(id: string) {
    const results = await db
      .select()
      .from(lucyMessages)
      .where(eq(lucyMessages.id, id))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Get the last N messages for a chat
   */
  static async findRecent(chatId: string, limit: number = 50) {
    return db
      .select()
      .from(lucyMessages)
      .where(eq(lucyMessages.chatId, chatId))
      .orderBy(desc(lucyMessages.createdAt))
      .limit(limit);
  }
}



