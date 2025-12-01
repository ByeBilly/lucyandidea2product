"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { LucyAssetsQuery, LucyAssetsEdit } from "@/lib/db/crud/lucy";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { createClient } from "@/lib/supabase/server";

interface Asset {
  id: string;
  type: string;
  url: string | null;
  prompt: string | null;
  cost: number;
  model: string;
  createdAt: Date;
}

interface GetAssetsResult {
  success: boolean;
  assets?: Asset[];
  error?: string;
}

interface DeleteAssetResult {
  success: boolean;
  error?: string;
}

interface CinemaData {
  videos: Asset[];
  audio: Asset | null;
}

interface GetCinemaDataResult {
  success: boolean;
  data?: CinemaData;
  error?: string;
}

/**
 * Get all assets for the current user
 */
export const getAssets = dataActionWithPermission(
  "lucyGetAssets",
  async (limit: number | undefined, userContext: UserContext): Promise<GetAssetsResult> => {
    try {
      if (!userContext.id) {
        return { success: false, error: "Not authenticated" };
      }

      const assets = await LucyAssetsQuery.findByUserId(userContext.id, limit);

      return {
        success: true,
        assets: assets.map(asset => ({
          id: asset.id,
          type: asset.type,
          url: asset.url,
          prompt: asset.prompt,
          cost: asset.cost,
          model: asset.model,
          createdAt: asset.createdAt,
        })),
      };
    } catch (error: any) {
      console.error("Lucy getAssets error:", error);
      return {
        success: false,
        error: error.message || "Failed to get assets",
      };
    }
  }
);

/**
 * Delete an asset
 */
export const deleteAsset = dataActionWithPermission(
  "lucyDeleteAsset",
  async (assetId: string, userContext: UserContext): Promise<DeleteAssetResult> => {
    try {
      if (!userContext.id) {
        return { success: false, error: "Not authenticated" };
      }

      // Verify the asset belongs to the user
      const asset = await LucyAssetsQuery.findById(assetId);
      if (!asset || asset.userId !== userContext.id) {
        return { success: false, error: "Asset not found" };
      }

      // Delete from storage if we have a storage key
      if (asset.storageKey) {
        const supabase = await createClient();
        await supabase.storage.from('assets').remove([asset.storageKey]);
      }

      // Delete from database
      await LucyAssetsEdit.delete(assetId);

      return { success: true };
    } catch (error: any) {
      console.error("Lucy deleteAsset error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete asset",
      };
    }
  }
);

/**
 * Get data for Cinema Mode (videos + latest audio)
 */
export const getCinemaData = dataActionWithPermission(
  "lucyGetAssets",
  async (_: void, userContext: UserContext): Promise<GetCinemaDataResult> => {
    try {
      if (!userContext.id) {
        return { success: false, error: "Not authenticated" };
      }

      const videos = await LucyAssetsQuery.findVideosForCinema(userContext.id);
      const audio = await LucyAssetsQuery.findLatestAudio(userContext.id);

      return {
        success: true,
        data: {
          videos: videos.map(v => ({
            id: v.id,
            type: v.type,
            url: v.url,
            prompt: v.prompt,
            cost: v.cost,
            model: v.model,
            createdAt: v.createdAt,
          })),
          audio: audio ? {
            id: audio.id,
            type: audio.type,
            url: audio.url,
            prompt: audio.prompt,
            cost: audio.cost,
            model: audio.model,
            createdAt: audio.createdAt,
          } : null,
        },
      };
    } catch (error: any) {
      console.error("Lucy getCinemaData error:", error);
      return {
        success: false,
        error: error.message || "Failed to get cinema data",
      };
    }
  }
);



