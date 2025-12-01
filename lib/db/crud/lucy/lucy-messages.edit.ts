import { db } from "@/lib/db/drizzle";
import { lucyMessages, NewLucyMessage } from "@/lib/db/schemas/lucy";
import { eq } from "drizzle-orm";

/**
 * Lucy Messages Edit Operations
 */
export class LucyMessagesEdit {
  /**
   * Create a new message
   */
  static async create(data: NewLucyMessage) {
    const results = await db.insert(lucyMessages).values(data).returning();
    return results[0];
  }

  /**
   * Create multiple messages
   */
  static async createMany(messages: NewLucyMessage[]) {
    if (messages.length === 0) return [];
    const results = await db.insert(lucyMessages).values(messages).returning();
    return results;
  }

  /**
   * Update a message
   */
  static async update(id: string, data: Partial<NewLucyMessage>) {
    const results = await db
      .update(lucyMessages)
      .set(data)
      .where(eq(lucyMessages.id, id))
      .returning();
    return results[0];
  }

  /**
   * Delete a message
   */
  static async delete(id: string) {
    await db.delete(lucyMessages).where(eq(lucyMessages.id, id));
  }

  /**
   * Delete all messages in a chat
   */
  static async deleteByChatId(chatId: string) {
    await db.delete(lucyMessages).where(eq(lucyMessages.chatId, chatId));
  }
}



