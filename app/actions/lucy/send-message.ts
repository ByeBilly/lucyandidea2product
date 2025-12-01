"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { LucyChatsEdit, LucyChatsQuery } from "@/lib/db/crud/lucy";
import { LucyMessagesEdit } from "@/lib/db/crud/lucy";
import { UserContext } from "@/lib/types/auth/user-context.bean";
import { createChatSession } from "@/features/lucy/services/gemini-service";

interface SendMessageInput {
  chatId?: string;
  text: string;
  attachments?: {
    data: string;
    mimeType: string;
    type: 'image' | 'audio';
  }[];
  apiKey?: string; // Client-provided API key for dev mode
}

interface SendMessageResult {
  success: boolean;
  chatId: string;
  userMessageId: string;
  botMessageId?: string;
  botText?: string;
  functionCalls?: {
    id: string;
    name: string;
    args: Record<string, any>;
  }[];
  error?: string;
}

/**
 * Send a message to Lucy and get a response
 */
export const sendMessage = dataActionWithPermission(
  "lucySendMessage",
  async (input: SendMessageInput, userContext: UserContext): Promise<SendMessageResult> => {
    try {
      if (!userContext.id) {
        return { success: false, chatId: '', userMessageId: '', error: "Not authenticated" };
      }

      // Get or create chat
      let chatId = input.chatId;
      if (!chatId) {
        const chat = await LucyChatsEdit.create({
          userId: userContext.id,
          title: input.text.slice(0, 50) + (input.text.length > 50 ? '...' : ''),
        });
        chatId = chat.id;
      }

      // Save user message
      const userMessage = await LucyMessagesEdit.create({
        chatId,
        role: 'user',
        content: input.text,
        attachments: input.attachments ? JSON.stringify(input.attachments) : null,
      });

      // TODO: Get user's current credits for system prompt
      // For now, using a placeholder - integrate with Unibee when ready
      const currentCredits = 100;

      // Create chat session and send message
      // Pass client API key if provided (dev mode)
      const chatSession = createChatSession(currentCredits, input.apiKey);
      
      // Build message parts
      const parts: any[] = [];
      if (input.text.trim()) {
        parts.push({ text: input.text });
      }
      input.attachments?.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data,
          }
        });
      });

      // Send to Gemini
      const response = await chatSession.sendMessage({ message: parts });
      const botText = response.text || "";
      const functionCalls = response.functionCalls;

      // Save bot message if there's text
      let botMessageId: string | undefined;
      if (botText) {
        const botMessage = await LucyMessagesEdit.create({
          chatId,
          role: 'model',
          content: botText,
        });
        botMessageId = botMessage.id;
      }

      // Update chat title if this was the first message
      if (!input.chatId) {
        await LucyChatsEdit.update(chatId, {
          title: input.text.slice(0, 50) + (input.text.length > 50 ? '...' : ''),
        });
      }

      return {
        success: true,
        chatId,
        userMessageId: userMessage.id,
        botMessageId,
        botText,
        functionCalls: functionCalls?.map(fc => ({
          id: fc.id || `fc-${Date.now()}`,
          name: fc.name,
          args: fc.args,
        })),
      };
    } catch (error: any) {
      console.error("Lucy sendMessage error:", error);
      return {
        success: false,
        chatId: input.chatId || '',
        userMessageId: '',
        error: error.message || "Failed to send message",
      };
    }
  }
);



