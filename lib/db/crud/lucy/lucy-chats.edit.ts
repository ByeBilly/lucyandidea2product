import { db } from "@/lib/db/drizzle";
import { lucyChats, lucyMessages, NewLucyChat } from "@/lib/db/schemas/lucy";
import { eq } from "drizzle-orm";

/**
 * Lucy Chats Edit Operations
 */
export class LucyChatsEdit {
  /**
   * Create a new chat
   */
  static async create(data: NewLucyChat) {
    const results = await db.insert(lucyChats).values(data).returning();
    return results[0];
  }

  /**
   * Update a chat
   */
  static async update(id: string, data: Partial<NewLucyChat>) {
    const results = await db
      .update(lucyChats)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lucyChats.id, id))
      .returning();
    return results[0];
  }

  /**
   * Delete a chat and all its messages
   */
  static async delete(id: string) {
    // Messages are cascade deleted via foreign key
    await db.delete(lucyChats).where(eq(lucyChats.id, id));
  }

  /**
   * Clear all chats for a user
   */
  static async clearUserChats(userId: string) {
    await db.delete(lucyChats).where(eq(lucyChats.userId, userId));
  }
}



