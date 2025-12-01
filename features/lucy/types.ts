/**
 * Lucy Feature - Type Definitions
 * Ported from visionarydirector/types.ts
 */

// ============================================
// USER TYPES (using idea2product's ProfileDto)
// ============================================

// Lucy uses idea2product's ProfileDto from lib/types/auth/profile.dto.ts
// No need to redefine User here

// ============================================
// CHAT TYPES
// ============================================

export interface LucyAttachment {
  data: string; // base64 or URL
  mimeType: string;
  type: 'image' | 'audio';
}

export interface LucyToolCall {
  name: string;
  args: Record<string, any>;
}

export interface LucyToolResponse {
  name: string;
  result: any;
  error?: string;
}

export interface LucyChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'model';
  content?: string;
  attachments?: LucyAttachment[];
  toolCalls?: LucyToolCall[];
  toolResponse?: LucyToolResponse;
  isLoading?: boolean;
  isError?: boolean;
  createdAt: Date;
}

export interface LucyChat {
  id: string;
  userId: string;
  title?: string;
  geminiSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ASSET TYPES
// ============================================

export type LucyAssetType = 'image' | 'video' | 'audio';

export interface LucyAsset {
  id: string;
  userId: string;
  chatId?: string;
  type: LucyAssetType;
  url: string;
  storageKey?: string;
  prompt: string;
  cost: number;
  model: string;
  width?: number;
  height?: number;
  duration?: number; // For video/audio in seconds
  mimeType?: string;
  createdAt: Date;
}

// ============================================
// TOOL/GENERATION TYPES
// ============================================

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type VideoAspectRatio = '16:9' | '9:16';
export type VoiceOption = 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

export interface GenerateImageParams {
  prompt: string;
  aspectRatio?: AspectRatio;
}

export interface GenerateVideoParams {
  prompt: string;
  aspectRatio?: VideoAspectRatio;
}

export interface AnimateImageParams {
  prompt?: string;
  imageUrl: string;
  aspectRatio: VideoAspectRatio;
}

export interface GenerateAudioParams {
  prompt: string;
  voice?: VoiceOption;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface LucyChatState {
  messages: LucyChatMessage[];
  isLoading: boolean;
  error?: string;
  currentChatId?: string;
}

export interface LucyAssetGalleryState {
  assets: LucyAsset[];
  isLoading: boolean;
  selectedAssetId?: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface LucyGenerationResult {
  success: boolean;
  asset?: LucyAsset;
  error?: string;
}

export interface LucyChatResponse {
  success: boolean;
  message?: LucyChatMessage;
  error?: string;
}





