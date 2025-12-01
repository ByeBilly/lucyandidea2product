import { db } from "@/lib/db/drizzle";
import { lucyAssets } from "@/lib/db/schemas/lucy";
import { eq, desc, and } from "drizzle-orm";

/**
 * Lucy Assets Query Operations
 */
export class LucyAssetsQuery {
  /**
   * Get all assets for a user
   */
  static async findByUserId(userId: string, limit?: number) {
    const query = db
      .select()
      .from(lucyAssets)
      .where(eq(lucyAssets.userId, userId))
      .orderBy(desc(lucyAssets.createdAt));
    
    if (limit) {
      return query.limit(limit);
    }
    return query;
  }

  /**
   * Get all assets for a chat
   */
  static async findByChatId(chatId: string) {
    return db
      .select()
      .from(lucyAssets)
      .where(eq(lucyAssets.chatId, chatId))
      .orderBy(desc(lucyAssets.createdAt));
  }

  /**
   * Get a single asset by ID
   */
  static async findById(id: string) {
    const results = await db
      .select()
      .from(lucyAssets)
      .where(eq(lucyAssets.id, id))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Get assets by type for a user
   */
  static async findByType(userId: string, type: 'image' | 'video' | 'audio') {
    return db
      .select()
      .from(lucyAssets)
      .where(and(eq(lucyAssets.userId, userId), eq(lucyAssets.type, type)))
      .orderBy(desc(lucyAssets.createdAt));
  }

  /**
   * Get video assets for cinema mode (oldest first for scene order)
   */
  static async findVideosForCinema(userId: string) {
    return db
      .select()
      .from(lucyAssets)
      .where(and(eq(lucyAssets.userId, userId), eq(lucyAssets.type, 'video')))
      .orderBy(lucyAssets.createdAt); // Oldest first for scene order
  }

  /**
   * Get the latest audio asset (for cinema mode background)
   */
  static async findLatestAudio(userId: string) {
    const results = await db
      .select()
      .from(lucyAssets)
      .where(and(eq(lucyAssets.userId, userId), eq(lucyAssets.type, 'audio')))
      .orderBy(desc(lucyAssets.createdAt))
      .limit(1);
    return results[0] || null;
  }
}



