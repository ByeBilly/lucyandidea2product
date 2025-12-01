"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Loader2, Image as ImageIcon, Video, Music, Wand2, Volume2, StopCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { SUNO_REFERRAL_URL } from '../constants';

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

interface ChatMessageData {
  id: string;
  role: 'user' | 'model';
  text?: string;
  attachments?: Attachment[];
  toolCalls?: ToolCall[];
  isLoading?: boolean;
  isError?: boolean;
}

// ============================================
// LYRICS CARD - Progressive Disclosure Magic ✨
// ============================================

/**
 * LyricsCard Component
 * CRITICAL: Suno button ONLY appears AFTER user clicks Copy
 * This is the progressive disclosure pattern that makes Lucy special
 */
const LyricsCard: React.FC<{ lyrics: string }> = ({ lyrics }) => {
  const [copied, setCopied] = useState(false);
  const [showSunoLink, setShowSunoLink] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setShowSunoLink(true); // THIS IS THE MAGIC - Progressive disclosure
  };

  return (
    <div className="my-4">
      <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-purple-900/40 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">🎵 Your Song Lyrics</span>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Lyrics'}
          </button>
        </div>
        <pre className="p-4 text-gray-200 whitespace-pre-wrap font-sans text-sm leading-relaxed max-h-80 overflow-y-auto">
          {lyrics}
        </pre>
      </div>

      {/* Suno Button - Appears ONLY after copying */}
      {showSunoLink && (
        <div className="mt-4 p-4 bg-gradient-to-r from-pink-900/20 to-orange-900/20 rounded-xl border border-pink-500/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-gray-300 text-sm mb-3">
            ✅ Lyrics copied! Now click below to create your song on Suno (250 free credits!):
          </p>
          <a
            href={SUNO_REFERRAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white rounded-xl font-semibold text-base transition-all shadow-lg hover:shadow-pink-500/25 hover:scale-105"
          >
            <ExternalLink className="w-5 h-5" />
            🎹 Open Suno - Make Your Song!
          </a>
          <p className="text-gray-400 text-xs mt-3">
            On Suno: Paste lyrics into "Song Description" → Pick a style → Click "Create"
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// SUNO LINK BUTTON (for markdown links)
// ============================================

const SunoLinkButton: React.FC<{ href: string }> = ({ href }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-3 my-3 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white rounded-xl font-semibold text-base transition-all shadow-lg hover:shadow-pink-500/25 hover:scale-105"
    >
      <ExternalLink className="w-5 h-5" />
      🎹 Open Suno (250 Free Credits!)
    </a>
  );
};

// ============================================
// CHAT MESSAGE COMPONENT
// ============================================

interface ChatMessageProps {
  message: ChatMessageData;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!message.text) return;

    // Strip markdown symbols for cleaner speech
    const cleanText = message.text
      .replace(/[*#_`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English")) ||
      voices.find(v => v.lang.includes("en-US")) ||
      voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex gap-4 p-4 ${isUser ? 'bg-transparent' : 'bg-gray-800/50'} rounded-lg transition-colors group`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-purple-600' : 'bg-emerald-600'}`}>
        {isUser ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1 justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-200">{isUser ? 'You' : 'Lucy'}</span>
            {/* Timestamp removed to prevent hydration mismatch */}
          </div>

          {/* TTS Button for Bot */}
          {!isUser && message.text && (
            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-full hover:bg-gray-700 transition-colors ${isSpeaking ? 'text-purple-400 bg-purple-500/10' : 'text-gray-500 opacity-0 group-hover:opacity-100'}`}
              title={isSpeaking ? "Stop reading" : "Read aloud"}
            >
              {isSpeaking ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Text Content with Markdown */}
        {message.text && (
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
            <ReactMarkdown
              components={{
                // Suno links become big buttons
                a: ({ node, href, children, ...props }) => {
                  if (href && href.includes('suno.com')) {
                    return <SunoLinkButton href={href} />;
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
                // ```lyrics blocks become LyricsCard
                code: ({ node, className, children, ...props }) => {
                  const isLyrics = className?.includes('language-lyrics');
                  const content = String(children).replace(/\n$/, '');

                  if (isLyrics) {
                    return <LyricsCard lyrics={content} />;
                  }

                  return (
                    <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-300 text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ node, children, ...props }) => {
                  const child = (children as any)?.[0];
                  if (child?.props?.className?.includes('language-lyrics')) {
                    return <>{children}</>;
                  }
                  return <pre className="bg-gray-900 p-3 rounded-lg overflow-x-auto" {...props}>{children}</pre>;
                },
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-4 rounded-lg border border-gray-700">
                    <table className="min-w-full divide-y divide-gray-700" {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th className="px-3 py-2 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="px-3 py-2 whitespace-normal bg-gray-800/50 text-sm text-gray-300 border-t border-gray-700" {...props} />
                ),
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        )}

        {/* User Uploaded Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.attachments.map((file, idx) => (
              <div key={idx} className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-sm">
                {file.type === 'image' ? (
                  <img
                    src={file.data.startsWith('data:') ? file.data : `data:${file.mimeType};base64,${file.data}`}
                    alt="User upload"
                    className="h-32 object-cover"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 min-w-[280px]">
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full border border-gray-700">
                      <Music className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Audio Attachment</div>
                      <audio
                        controls
                        src={file.data.startsWith('data:') ? file.data : `data:${file.mimeType};base64,${file.data}`}
                        className="h-8 w-full max-w-[240px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tool Calls (Loading State) */}
        {message.toolCalls && (
          <div className="mt-3 flex flex-col gap-2">
            {message.toolCalls.map(tool => (
              <div key={tool.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded border border-gray-700/50">
                {tool.name === 'generate_image' && <ImageIcon className="w-4 h-4 text-purple-400" />}
                {tool.name === 'generate_video' && <Video className="w-4 h-4 text-blue-400" />}
                {tool.name === 'generate_audio' && <Music className="w-4 h-4 text-yellow-400" />}
                {tool.name === 'animate_image' && <Wand2 className="w-4 h-4 text-pink-400" />}

                <span className="text-sm text-gray-400 italic">
                  Working my magic on {tool.name.replace('generate_', '').replace('animate_', '')}...
                </span>
                <Loader2 className="w-4 h-4 text-gray-500 animate-spin ml-auto" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;




