"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { LucyAssetsEdit } from "@/lib/db/crud/lucy";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { generateAudio, PRICING } from "@/features/lucy/services/gemini-service";
import { createClient } from "@/lib/supabase/server";

interface GenerateAudioInput {
  chatId?: string;
  prompt: string;
  voice?: 'Puck' | 'Charon' | 'Kore' | 'Fenrir';
}

interface GenerateAudioResult {
  success: boolean;
  assetId?: string;
  audioBase64?: string; // Client converts PCM to WAV
  cost: number;
  error?: string;
}

/**
 * Generate audio/speech using Lucy's Gemini TTS integration
 */
export const lucyGenerateAudio = dataActionWithPermission(
  "lucyGenerateAudio",
  async (input: GenerateAudioInput, userContext: UserContext): Promise<GenerateAudioResult> => {
    const cost = PRICING.generate_audio;

    try {
      if (!userContext.id) {
        return { success: false, cost, error: "Not authenticated" };
      }

      // Generate audio (returns base64 PCM)
      const base64Audio = await generateAudio(
        input.prompt,
        input.voice || 'Kore'
      );

      // Save asset reference to database
      // Note: Audio is returned as base64 for client-side WAV conversion
      // We could also convert server-side and upload to storage
      const asset = await LucyAssetsEdit.create({
        userId: userContext.id,
        chatId: input.chatId,
        type: 'audio',
        url: '', // Will be set client-side after WAV conversion
        prompt: input.prompt,
        cost,
        model: 'gemini-2.5-flash-preview-tts',
        mimeType: 'audio/wav',
      });

      return {
        success: true,
        assetId: asset.id,
        audioBase64: base64Audio,
        cost,
      };
    } catch (error: any) {
      console.error("Lucy generateAudio error:", error);
      return {
        success: false,
        cost,
        error: error.message || "Failed to generate audio",
      };
    }
  }
);



