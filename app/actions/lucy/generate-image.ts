"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { LucyAssetsEdit } from "@/lib/db/crud/lucy";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { generateImage, PRICING } from "@/features/lucy/services/gemini-service";
import { createClient } from "@/lib/supabase/server";

interface GenerateImageInput {
  chatId?: string;
  prompt: string;
  aspectRatio?: string;
}

interface GenerateImageResult {
  success: boolean;
  assetId?: string;
  url?: string;
  cost: number;
  error?: string;
}

/**
 * Generate an image using Lucy's Gemini integration
 */
export const lucyGenerateImage = dataActionWithPermission(
  "lucyGenerateImage",
  async (input: GenerateImageInput, userContext: UserContext): Promise<GenerateImageResult> => {
    const cost = PRICING.generate_image;

    try {
      if (!userContext.id) {
        return { success: false, cost, error: "Not authenticated" };
      }

      // TODO: Check user credits via Unibee integration
      // For now, proceeding without credit check

      // Generate image
      const result = await generateImage(
        input.prompt,
        "1024x1024",
        input.aspectRatio || "16:9"
      );

      // Upload to Supabase Storage
      const supabase = await createClient();
      const fileName = `lucy/${userContext.id}/${Date.now()}.png`;
      
      // Convert base64 to buffer
      const buffer = Buffer.from(result.data, 'base64');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, buffer, {
          contentType: result.mimeType,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Fall back to data URL if storage upload fails
        const dataUrl = `data:${result.mimeType};base64,${result.data}`;
        
        const asset = await LucyAssetsEdit.create({
          userId: userContext.id,
          chatId: input.chatId,
          type: 'image',
          url: dataUrl,
          prompt: input.prompt,
          cost,
          model: 'gemini-3-pro-image-preview',
          mimeType: result.mimeType,
        });

        return { success: true, assetId: asset.id, url: dataUrl, cost };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      // Save asset to database
      const asset = await LucyAssetsEdit.create({
        userId: userContext.id,
        chatId: input.chatId,
        type: 'image',
        url: urlData.publicUrl,
        storageKey: fileName,
        prompt: input.prompt,
        cost,
        model: 'gemini-3-pro-image-preview',
        mimeType: result.mimeType,
      });

      // TODO: Deduct credits via Unibee

      return {
        success: true,
        assetId: asset.id,
        url: urlData.publicUrl,
        cost,
      };
    } catch (error: any) {
      console.error("Lucy generateImage error:", error);
      return {
        success: false,
        cost,
        error: error.message || "Failed to generate image",
      };
    }
  }
);



