"use client";

import { useState, useCallback, useEffect } from 'react';
import { sendMessage } from '@/app/actions/lucy';
import { getChatMessages, getChatHistory } from '@/app/actions/lucy';

// ============================================
// TYPES
// ============================================

interface Attachment {
  data: string;
  mimeType: string;
  type: 'image' | 'audio';
}

interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text?: string;
  attachments?: Attachment[];
  toolCalls?: ToolCall[];
  isLoading?: boolean;
  isError?: boolean;
}

interface Chat {
  id: string;
  title: string | null;
  createdAt: Date;
}

interface UseLucyChatReturn {
  // State
  messages: Message[];
  chats: Chat[];
  currentChatId: string | null;
  isProcessing: boolean;
  error: string | null;
  
  // Actions
  sendUserMessage: (text: string, attachments?: Attachment[]) => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  startNewChat: () => void;
  loadChatHistory: () => Promise<void>;
  clearError: () => void;
}

// ============================================
// HOOK
// ============================================

interface UseLucyChatOptions {
  apiKey?: string;
}

export function useLucyChat(options: UseLucyChatOptions = {}): UseLucyChatReturn {
  const { apiKey } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat history on mount
  const loadChatHistory = useCallback(async () => {
    try {
      const result = await getChatHistory();
      if (result.success && result.chats) {
        setChats(result.chats.map(c => ({
          id: c.id,
          title: c.title,
          createdAt: c.createdAt,
        })));
      }
    } catch (err: any) {
      console.error('Failed to load chat history:', err);
    }
  }, []);

  // Load a specific chat
  const loadChat = useCallback(async (chatId: string) => {
    try {
      const result = await getChatMessages(chatId);
      if (result.success && result.messages) {
        setMessages(result.messages.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'model',
          text: msg.content || undefined,
          attachments: msg.attachments ? JSON.parse(msg.attachments) : undefined,
          toolCalls: msg.toolCalls ? JSON.parse(msg.toolCalls) : undefined,
          isError: msg.isError || false,
        })));
        setCurrentChatId(chatId);
      }
    } catch (err: any) {
      console.error('Failed to load chat:', err);
      setError('Failed to load chat');
    }
  }, []);

  // Start a new chat
  const startNewChat = useCallback(() => {
    setMessages([]);
    setCurrentChatId(null);
    setError(null);
  }, []);

  // Send a message
  const sendUserMessage = useCallback(async (text: string, attachments?: Attachment[]) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    setIsProcessing(true);
    setError(null);

    // Add user message to UI immediately
    const tempUserMessageId = `temp-${Date.now()}`;
    const userMessage: Message = {
      id: tempUserMessageId,
      role: 'user',
      text,
      attachments,
    };
    setMessages(prev => [...prev, userMessage]);

    // Add loading indicator
    const tempBotMessageId = `loading-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: tempBotMessageId,
      role: 'model',
      isLoading: true,
    }]);

    try {
      const result = await sendMessage({
        chatId: currentChatId || undefined,
        text,
        attachments,
        apiKey: apiKey || undefined,
      });

      if (!result.success) {
        // Remove loading message and show error
        setMessages(prev => prev.filter(m => m.id !== tempBotMessageId));
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'model',
          text: result.error || "I'm having a little technical hiccup. Could you try saying that again?",
          isError: true,
        }]);
        setError(result.error || 'Failed to send message');
        return;
      }

      // Update chat ID if this was a new chat
      if (!currentChatId && result.chatId) {
        setCurrentChatId(result.chatId);
        // Refresh chat history to show new chat
        loadChatHistory();
      }

      // Update user message with real ID
      setMessages(prev => prev.map(m => 
        m.id === tempUserMessageId ? { ...m, id: result.userMessageId } : m
      ));

      // Replace loading message with actual response
      setMessages(prev => prev.filter(m => m.id !== tempBotMessageId));
      
      if (result.botText) {
        setMessages(prev => [...prev, {
          id: result.botMessageId || `bot-${Date.now()}`,
          role: 'model',
          text: result.botText,
        }]);
      }

      // Handle function calls if any
      if (result.functionCalls && result.functionCalls.length > 0) {
        setMessages(prev => [...prev, {
          id: `tools-${Date.now()}`,
          role: 'model',
          toolCalls: result.functionCalls,
        }]);
        
        // TODO: Execute tool calls and continue conversation
        // This would involve calling the generate actions and then
        // sending the results back to the chat
      }

    } catch (err: any) {
      // Remove loading message and show error
      setMessages(prev => prev.filter(m => m.id !== tempBotMessageId));
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'model',
        text: "I'm having a little technical hiccup. Could you try saying that again?",
        isError: true,
      }]);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsProcessing(false);
    }
  }, [currentChatId, loadChatHistory, apiKey]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    chats,
    currentChatId,
    isProcessing,
    error,
    sendUserMessage,
    loadChat,
    startNewChat,
    loadChatHistory,
    clearError,
  };
}

export default useLucyChat;



