import { db } from "@/lib/db/drizzle";
import { lucyChats, lucyMessages } from "@/lib/db/schemas/lucy";
import { eq, desc } from "drizzle-orm";

/**
 * Lucy Chats Query Operations
 */
export class LucyChatsQuery {
  /**
   * Get all chats for a user
   */
  static async findByUserId(userId: string) {
    return db
      .select()
      .from(lucyChats)
      .where(eq(lucyChats.userId, userId))
      .orderBy(desc(lucyChats.updatedAt));
  }

  /**
   * Get a single chat by ID
   */
  static async findById(id: string) {
    const results = await db
      .select()
      .from(lucyChats)
      .where(eq(lucyChats.id, id))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Get the most recent chat for a user
   */
  static async findMostRecent(userId: string) {
    const results = await db
      .select()
      .from(lucyChats)
      .where(eq(lucyChats.userId, userId))
      .orderBy(desc(lucyChats.updatedAt))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Get chat with messages
   */
  static async findWithMessages(chatId: string) {
    const chat = await this.findById(chatId);
    if (!chat) return null;

    const messages = await db
      .select()
      .from(lucyMessages)
      .where(eq(lucyMessages.chatId, chatId))
      .orderBy(lucyMessages.createdAt);

    return { ...chat, messages };
  }
}



