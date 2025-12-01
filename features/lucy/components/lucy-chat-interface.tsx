"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Film, Plus, Loader2, X, Image as ImageIcon, Music } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { AssetCard } from './asset-card';
import { useLucyChat } from '../hooks/use-lucy-chat';
import { getAssets, getCinemaData } from '@/app/actions/lucy';
import { LUCY_INTRO_MESSAGE, LUCY_PLACEHOLDER_PROMPTS } from '../constants';

// ============================================
// TYPES
// ============================================

interface Asset {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string | null;
  prompt: string | null;
  cost: number;
  model: string;
  createdAt: Date;
}

interface LucyChatInterfaceProps {
  userId: string;
  userCredits?: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function LucyChatInterface({ userId, userCredits = 100 }: LucyChatInterfaceProps) {
  const {
    messages,
    chats,
    currentChatId,
    isProcessing,
    error,
    sendUserMessage,
    loadChat,
    startNewChat,
    loadChatHistory,
  } = useLucyChat();

  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<{ data: string; mimeType: string; type: 'image' | 'audio' }[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showCinema, setShowCinema] = useState(false);
  const [cinemaData, setCinemaData] = useState<{ videos: Asset[]; audio: Asset | null } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial data
  useEffect(() => {
    loadChatHistory();
    loadAssets();
  }, [loadChatHistory]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAssets = async () => {
    const result = await getAssets(50);
    if (result.success && result.assets) {
      setAssets(result.assets as Asset[]);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    
    const text = inputValue;
    const atts = [...attachments];
    
    setInputValue('');
    setAttachments([]);
    
    await sendUserMessage(text, atts);
    
    // Refresh assets after potential generation
    setTimeout(loadAssets, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const type = file.type.startsWith('image/') ? 'image' : 'audio';
        setAttachments(prev => [...prev, {
          data: base64,
          mimeType: file.type,
          type,
        }]);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCinemaMode = async () => {
    const result = await getCinemaData();
    if (result.success && result.data) {
      setCinemaData(result.data as { videos: Asset[]; audio: Asset | null });
      setShowCinema(true);
    }
  };

  const handleAssetClick = (asset: Asset) => {
    // TODO: Open asset in modal/lightbox
    console.log('Asset clicked:', asset);
  };

  const handleAssetShare = async (asset: Asset) => {
    if (navigator.share && asset.url) {
      try {
        await navigator.share({
          title: 'Check out what I created with Lucy!',
          text: asset.prompt || 'Created with Lucy',
          url: asset.url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  // Prepare messages for display, adding intro if empty
  const displayMessages = messages.length === 0 
    ? [{ id: 'intro', role: 'model' as const, text: LUCY_INTRO_MESSAGE }]
    : messages;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Asset Gallery */}
      <aside className="hidden md:flex w-80 flex-col bg-gray-900 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Your Creations</h2>
            <p className="text-sm text-gray-400">{assets.length} items</p>
          </div>
          <button
            onClick={startNewChat}
            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            title="New Project"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {assets.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Your generated content will appear here</p>
            </div>
          ) : (
            assets.map(asset => (
              <AssetCard
                key={asset.id}
                asset={{
                  id: asset.id,
                  type: asset.type,
                  url: asset.url || '',
                  prompt: asset.prompt || '',
                  createdAt: new Date(asset.createdAt).getTime(),
                  cost: asset.cost,
                  model: asset.model,
                }}
                onClick={() => handleAssetClick(asset)}
                onShare={() => handleAssetShare(asset)}
              />
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleCinemaMode}
            disabled={assets.filter(a => a.type === 'video').length === 0}
            className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Film className="w-5 h-5" />
            🎬 Cinema Mode
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-[#0f0f11]">
        {/* Chat Header */}
        <header className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white text-lg">✨</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Lucy</h1>
              <p className="text-sm text-gray-400">Your creative companion</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Credits: <span className="text-purple-400 font-medium">{userCredits}</span>
            </span>
            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-gray-400 hover:text-white">
              <Film className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-2">
            {displayMessages.map(message => (
              <ChatMessage
                key={message.id}
                message={{
                  id: message.id,
                  role: message.role,
                  text: message.text,
                  attachments: message.attachments,
                  toolCalls: message.toolCalls,
                  isLoading: message.isLoading,
                  isError: message.isError,
                }}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-800">
            <div className="max-w-3xl mx-auto flex gap-2 flex-wrap">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative group">
                  {att.type === 'image' ? (
                    <img
                      src={`data:${att.mimeType};base64,${att.data}`}
                      alt="Attachment"
                      className="h-16 w-16 object-cover rounded-lg border border-gray-700"
                    />
                  ) : (
                    <div className="h-16 w-16 flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700">
                      <Music className="w-6 h-6 text-purple-400" />
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="max-w-3xl mx-auto">
            {/* Quick prompts for empty state */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {LUCY_PLACEHOLDER_PROMPTS.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputValue(prompt)}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-full border border-gray-700 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              {/* Attachment button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                title="Attach image or audio"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,audio/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              
              {/* Text input */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell Lucy what you'd like to create..."
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              />
              
              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={isProcessing || (!inputValue.trim() && attachments.length === 0)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Cinema Mode Modal */}
      {showCinema && cinemaData && (
        <CinemaMode
          videos={cinemaData.videos}
          audio={cinemaData.audio}
          onClose={() => setShowCinema(false)}
        />
      )}
    </div>
  );
}

// ============================================
// CINEMA MODE COMPONENT
// ============================================

interface CinemaModeProps {
  videos: Asset[];
  audio: Asset | null;
  onClose: () => void;
}

function CinemaMode({ videos, audio, onClose }: CinemaModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Start playing when component mounts
    if (videoRef.current) {
      videoRef.current.play();
    }
    if (audioRef.current && audio?.url) {
      audioRef.current.play();
    }
  }, [audio]);

  const handleVideoEnd = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Loop back to start
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    // Play new video when index changes
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, [currentIndex]);

  if (videos.length === 0) {
    return null;
  }

  const currentVideo = videos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white z-10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Progress indicator */}
      <div className="absolute top-4 left-4 text-white text-sm z-10">
        {currentIndex + 1} / {videos.length}
      </div>

      {/* Video player */}
      <video
        ref={videoRef}
        src={currentVideo.url || ''}
        className="max-w-full max-h-full"
        onEnded={handleVideoEnd}
        playsInline
      />

      {/* Background audio */}
      {audio?.url && (
        <audio
          ref={audioRef}
          src={audio.url}
          loop
          className="hidden"
        />
      )}

      {/* Video title */}
      <div className="absolute bottom-4 left-4 right-4 text-white text-center">
        <p className="text-sm text-gray-400">{currentVideo.prompt}</p>
      </div>
    </div>
  );
}

export default LucyChatInterface;



