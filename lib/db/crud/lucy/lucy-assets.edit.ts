import { db } from "@/lib/db/drizzle";
import { lucyAssets, NewLucyAsset } from "@/lib/db/schemas/lucy";
import { eq } from "drizzle-orm";

/**
 * Lucy Assets Edit Operations
 */
export class LucyAssetsEdit {
  /**
   * Create a new asset
   */
  static async create(data: NewLucyAsset) {
    const results = await db.insert(lucyAssets).values(data).returning();
    return results[0];
  }

  /**
   * Update an asset
   */
  static async update(id: string, data: Partial<NewLucyAsset>) {
    const results = await db
      .update(lucyAssets)
      .set(data)
      .where(eq(lucyAssets.id, id))
      .returning();
    return results[0];
  }

  /**
   * Delete an asset
   */
  static async delete(id: string) {
    await db.delete(lucyAssets).where(eq(lucyAssets.id, id));
  }

  /**
   * Delete all assets for a user
   */
  static async deleteByUserId(userId: string) {
    await db.delete(lucyAssets).where(eq(lucyAssets.userId, userId));
  }
}



