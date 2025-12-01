"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { LucyAssetsEdit } from "@/lib/db/crud/lucy";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { generateVideo, animateImage, PRICING } from "@/features/lucy/services/gemini-service";
import { createClient } from "@/lib/supabase/server";

interface GenerateVideoInput {
  chatId?: string;
  prompt: string;
  aspectRatio?: string;
}

interface AnimateImageInput {
  chatId?: string;
  imageData: string;
  imageMimeType: string;
  prompt?: string;
  aspectRatio: string;
}

interface GenerateVideoResult {
  success: boolean;
  assetId?: string;
  url?: string;
  cost: number;
  error?: string;
}

/**
 * Generate a video using Lucy's Gemini/Veo integration
 */
export const lucyGenerateVideo = dataActionWithPermission(
  "lucyGenerateVideo",
  async (input: GenerateVideoInput, userContext: UserContext): Promise<GenerateVideoResult> => {
    const cost = PRICING.generate_video;

    try {
      if (!userContext.id) {
        return { success: false, cost, error: "Not authenticated" };
      }

      // Rate limiting delay (intentional - see FROMLUCY.md notes)
      await new Promise(resolve => setTimeout(resolve, 20000));

      // Generate video
      const videoBlob = await generateVideo(
        input.prompt,
        input.aspectRatio || "16:9"
      );

      // Upload to Supabase Storage
      const supabase = await createClient();
      const fileName = `lucy/${userContext.id}/${Date.now()}.mp4`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, videoBlob, {
          contentType: 'video/mp4',
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return { success: false, cost, error: "Failed to upload video" };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      // Save asset to database
      const asset = await LucyAssetsEdit.create({
        userId: userContext.id,
        chatId: input.chatId,
        type: 'video',
        url: urlData.publicUrl,
        storageKey: fileName,
        prompt: input.prompt,
        cost,
        model: 'veo-3.1-fast-generate-preview',
        mimeType: 'video/mp4',
      });

      return {
        success: true,
        assetId: asset.id,
        url: urlData.publicUrl,
        cost,
      };
    } catch (error: any) {
      console.error("Lucy generateVideo error:", error);
      return {
        success: false,
        cost,
        error: error.message || "Failed to generate video",
      };
    }
  }
);

/**
 * Animate an image to create a video
 */
export const lucyAnimateImage = dataActionWithPermission(
  "lucyAnimateImage",
  async (input: AnimateImageInput, userContext: UserContext): Promise<GenerateVideoResult> => {
    const cost = PRICING.animate_image;

    try {
      if (!userContext.id) {
        return { success: false, cost, error: "Not authenticated" };
      }

      // Generate video from image
      const videoBlob = await animateImage(
        { data: input.imageData, mimeType: input.imageMimeType },
        input.prompt,
        input.aspectRatio
      );

      // Upload to Supabase Storage
      const supabase = await createClient();
      const fileName = `lucy/${userContext.id}/${Date.now()}.mp4`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, videoBlob, {
          contentType: 'video/mp4',
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return { success: false, cost, error: "Failed to upload video" };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      // Save asset to database
      const asset = await LucyAssetsEdit.create({
        userId: userContext.id,
        chatId: input.chatId,
        type: 'video',
        url: urlData.publicUrl,
        storageKey: fileName,
        prompt: input.prompt || "Animated image",
        cost,
        model: 'veo-3.1-fast-generate-preview',
        mimeType: 'video/mp4',
      });

      return {
        success: true,
        assetId: asset.id,
        url: urlData.publicUrl,
        cost,
      };
    } catch (error: any) {
      console.error("Lucy animateImage error:", error);
      return {
        success: false,
        cost,
        error: error.message || "Failed to animate image",
      };
    }
  }
);



