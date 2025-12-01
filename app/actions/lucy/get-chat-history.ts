"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";
import { LucyChatsQuery, LucyMessagesQuery } from "@/lib/db/crud/lucy";
import { UserContext } from "@/lib/types/auth/user-context.bean";

interface GetChatHistoryResult {
  success: boolean;
  chats?: {
    id: string;
    title: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
  error?: string;
}

interface GetChatMessagesResult {
  success: boolean;
  messages?: {
    id: string;
    role: string;
    content: string | null;
    attachments: any;
    toolCalls: any;
    toolResponse: any;
    isError: boolean | null;
    createdAt: Date;
  }[];
  error?: string;
}

/**
 * Get all chats for the current user
 */
export const getChatHistory = dataActionWithPermission(
  "lucyGetChatHistory",
  async (_: void, userContext: UserContext): Promise<GetChatHistoryResult> => {
    try {
      if (!userContext.id) {
        return { success: false, error: "Not authenticated" };
      }

      const chats = await LucyChatsQuery.findByUserId(userContext.id);

      return {
        success: true,
        chats: chats.map(chat => ({
          id: chat.id,
          title: chat.title,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        })),
      };
    } catch (error: any) {
      console.error("Lucy getChatHistory error:", error);
      return {
        success: false,
        error: error.message || "Failed to get chat history",
      };
    }
  }
);

/**
 * Get messages for a specific chat
 */
export const getChatMessages = dataActionWithPermission(
  "lucyGetChatHistory",
  async (chatId: string, userContext: UserContext): Promise<GetChatMessagesResult> => {
    try {
      if (!userContext.id) {
        return { success: false, error: "Not authenticated" };
      }

      // Verify the chat belongs to the user
      const chat = await LucyChatsQuery.findById(chatId);
      if (!chat || chat.userId !== userContext.id) {
        return { success: false, error: "Chat not found" };
      }

      const messages = await LucyMessagesQuery.findByChatId(chatId);

      return {
        success: true,
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          attachments: msg.attachments,
          toolCalls: msg.toolCalls,
          toolResponse: msg.toolResponse,
          isError: msg.isError,
          createdAt: msg.createdAt,
        })),
      };
    } catch (error: any) {
      console.error("Lucy getChatMessages error:", error);
      return {
        success: false,
        error: error.message || "Failed to get messages",
      };
    }
  }
);



