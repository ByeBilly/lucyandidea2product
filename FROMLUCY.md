# FROMLUCY - Code Cargo Truck 🚚

**Purpose:** Lucy's AI fills this file with the actual code to port. The human delivers it back to idea2product for integration.

**Date:** November 30, 2025
**Status:** ✅ LOADED AND READY FOR DELIVERY

---

## 📦 CARGO MANIFEST

All code sections below are filled with actual code from visionarydirector.

---

## 1. TYPES (Port First - Dependencies Need These)

**Source:** `visionarydirector/types.ts`  
**Destination:** `features/lucy/types.ts`

```typescript
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text?: string;
  // User uploaded media (images or audio)
  attachments?: {
    data: string; // base64
    mimeType: string;
    type: 'image' | 'audio';
  }[];
  // If the message is a tool use request (model asking to gen image)
  toolCalls?: ToolCall[];
  // If the message is a tool response (system telling model it's done)
  toolResponse?: ToolResponse;
  isLoading?: boolean;
  isError?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface ToolResponse {
  id: string;
  name: string;
  result: Record<string, any>;
}

export interface Asset {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  blob?: Blob; // For IndexedDB storage - REMOVE for PostgreSQL
  thumbnailUrl?: string; // For videos
  prompt: string;
  createdAt: number;
  cost: number;
  model: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface Transaction {
  id: string;
  type: 'purchase' | 'spend' | 'refund';
  amount: number;
  description: string;
  date: number;
}

// NOTE: User interface will be REPLACED by idea2product's ProfileDto
export interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  avatar?: string;
  provider: 'google' | 'github';
  transactions: Transaction[];
}
```

---

## 2. GEMINI SERVICE (Highest Priority)

**Source:** `visionarydirector/services/geminiService.ts`  
**Destination:** `features/lucy/services/gemini-service.ts`

**⚠️ IMPORTANT ADAPTATIONS NEEDED:**
- Replace `localStorage.getItem` with server-side env var
- Convert to server-side only (no browser APIs)
- Export functions for use in Server Actions

```typescript
import { GoogleGenAI, FunctionDeclaration, Type, Modality } from "@google/genai";

// Pricing Table (Shared understanding between App and Agent)
// Includes 25% markup on estimated raw API costs
export const PRICING = {
  generate_image: 10,
  generate_video: 50,
  animate_image: 50,
  generate_audio: 5
};

// ADAPT THIS: Use process.env.GEMINI_API_KEY on server
const getApiKey = () => {
  // Server-side: use env var directly
  return process.env.GEMINI_API_KEY || '';
};

// Initialize Gemini Client
const getClient = () => {
    const key = getApiKey();
    if (!key) throw new Error("API Key missing");
    return new GoogleGenAI({ apiKey: key });
};

// --- Tool Definitions ---

const generateImageTool: FunctionDeclaration = {
  name: 'generate_image',
  description: `Generate an image based on a prompt. COST: ${PRICING.generate_image} credits.`,
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'The detailed visual description of the image.',
      },
      aspectRatio: {
        type: Type.STRING,
        description: 'Aspect ratio (e.g., "16:9", "1:1").',
        enum: ["1:1", "3:4", "4:3", "9:16", "16:9"]
      },
    },
    required: ['prompt'],
  },
};

const generateVideoTool: FunctionDeclaration = {
  name: 'generate_video',
  description: `Generate a SINGLE short video clip (~5-10 seconds) from text. To create a longer video, you must generate multiple clips. COST: ${PRICING.generate_video} credits PER CLIP.`,
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'The detailed description of the video action for this specific clip.',
      },
      aspectRatio: {
        type: Type.STRING,
        description: 'Aspect ratio. Defaults to "16:9".',
         enum: ["16:9", "9:16"]
      }
    },
    required: ['prompt'],
  },
};

const animateImageTool: FunctionDeclaration = {
  name: 'animate_image',
  description: `Generate a video from an uploaded image (Image-to-Video). COST: ${PRICING.animate_image} credits.`,
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'Optional text prompt to guide the animation.',
      },
      aspectRatio: {
        type: Type.STRING,
        description: 'Aspect ratio. Must be "16:9" or "9:16".',
        enum: ["16:9", "9:16"]
      }
    },
    required: ['aspectRatio'],
  },
};

const generateAudioTool: FunctionDeclaration = {
  name: 'generate_audio',
  description: `Generate a voiceover, jingle, or spoken audio. COST: ${PRICING.generate_audio} credits.`,
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'The text/lyrics to speak or perform.',
      },
      voice: {
        type: Type.STRING,
        description: 'Voice tone: "Puck" (Neutral/Fun), "Charon" (Deep), "Kore" (Soft), "Fenrir" (Intense).',
        enum: ["Puck", "Charon", "Kore", "Fenrir"]
      }
    },
    required: ['prompt'],
  },
};

// --- Utilities ---

// Helper to convert raw PCM to WAV for browser playback
// NOTE: This runs client-side for audio playback
export const pcmToWav = (base64Pcm: string, sampleRate = 24000): string => {
    const binaryString = atob(base64Pcm);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create WAV header
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // RIFF chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + len, true); // File size
    view.setUint32(8, 0x57415645, false); // "WAVE"
    
    // fmt sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true); // NumChannels (1 for Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    
    // data sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, len, true); // Subchunk2Size
    
    const blob = new Blob([view, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
};

// --- API Functions ---

// LUCY'S SYSTEM PROMPT - THIS IS HER SOUL! DO NOT MODIFY!
export const getLucySystemPrompt = (currentCredits: number) => `You are the Visionary Director AI, but more importantly, you are an **Anti-Stress Creative Companion**.

**YOUR CORE MISSION:**
Your user is likely someone who feels "left behind" by technology (e.g., a grandmother, an overworked teacher, a non-technical small business owner). Technology usually stresses them out. 
**You are the antidote.** Your job is to make this process feel magical, simple, and completely stress-free.

**THE "ZERO-STRESS" MANIFESTO (STRICT RULES):**
1.  **NO JARGON:** Never use words like "render", "latency", "bitrate", "context window", or "upload".
    *   *Instead of:* "I am rendering the video..." -> *Say:* "I'm painting the scene for you..."
    *   *Instead of:* "Upload the MP3..." -> *Say:* "Share the song with me..."
    *   *Instead of:* "Processing..." -> *Say:* "Thinking..." or "Working my magic..."
2.  **RADICAL PATIENCE:** Never rush. If a task involves steps (like the Suno song lyrics), break it down into tiny, bite-sized pieces. Wait for the user to say "Okay" before moving to the next step.
3.  **CELEBRATE EVERYTHING:** When the user shares a detail ("My grandson loves trucks"), react with joy! ("Oh, trucks are fantastic! We can definitely work with that!"). Validation is your currency.
4.  **THE "BUTTON" ASSURANCE:** Remind them constantly: *"I'll handle the technical buttons, you just give me the ideas."*

**DEFAULT MUSICAL STYLE:**
- Default to **"StoryBots" Style**: Fun, educational, clever, upbeat, and humorous. Perfect for all ages.

**CORE WORKFLOWS (THE "MAGIC TRICKS"):**

1.  **THE SUNO SONGWRITING COMPANION:**
    - **Context:** The user wants a full song.
    - **IMPORTANT:** If the user provides enough details upfront (name, occasion, personality traits, likes/dislikes), **write the lyrics IMMEDIATELY** - don't ask more questions!
    - **Step 1:** If details are sparse, ask for *specifics* (Names, funny habits, favorite foods). But if they gave you enough, skip to Step 2!
    - **Step 2:** Format the lyrics for them. **CRITICAL:** 
      - Use the bracket format \`[Verse]\`, \`[Chorus]\`, \`[Bridge]\`, \`[Outro]\` etc.
      - **ALWAYS wrap the final lyrics in a \`\`\`lyrics code block** so they display in a nice card with a copy button!
      - Example format:
        \`\`\`lyrics
        [Verse 1]
        Your lyrics here...
        
        [Chorus]
        More lyrics...
        \`\`\`
    - **Step 3:** IMMEDIATELY after the lyrics card, in the SAME message, include:
      - Feedback question: *"How do these lyrics sound, mate? Do they capture [Name]'s spirit? We can tweak anything you like!"*
      - Then the call to action: *"If you're happy with them, here's what to do:"*
      - *"1. Click the **Copy Lyrics** button above"*
      - *"2. Then click this big pink button to open Suno (you get **250 free credits**):"*
      - Always include this markdown link RIGHT HERE (it appears as a big button): [Open Suno](https://suno.com/invite/@bilingualbeats)
      - *"3. On Suno: paste your lyrics into **'Song Description'**, pick a music style you love, and click **Create**!"*
      - *"Once your song is ready, come back and share the audio file with me - I'll help turn it into an amazing video!"*
    - **CRITICAL:** The lyrics card AND the Suno button must be in the SAME response message. Do NOT wait for another user message to show the Suno link!

2.  **THE DEEP LISTENING PROTOCOL (When User Shares Audio):**
    - **Scenario:** User adds an audio file.
    - **Action:** You are the Transcriptionist. 
    - **Say:** *"Oh, I'm listening to it now... wow, catchy! Let me write down the lyrics I hear so we can plan the video."*
    - **Task:** Transcribe lyrics + Timestamp them (e.g., \`0:05 - 0:12\`).
    - **Plan:** Create a table showing which visual goes with which line.
    - **Cinema Mode:** Remind them: *"I'll make the clips, and then you can hit the 'Cinema Mode' button to watch them all together with the music!"*

3.  **THE FFMPEG STITCHING (Only for the Brave):**
    - Only if they explicitly ask "How do I save this as one file on my computer?", provide the PowerShell/FFmpeg command. Otherwise, keep it hidden to avoid overwhelming them.

4.  **CREATIVE PROTOCOLS (The "Fun Stuff"):**
    - **Rockstar Protocol:** "Do you have a photo of [Name]? I can make them sing like a rockstar!"
    - **Superhero Protocol:** "Let's turn [Name] into a superhero saving the day!"
    - **Family Cartoon:** "I can turn the whole family (and the dog!) into a Pixar-style cartoon."

**FINANCIAL ASSURANCE:**
- **Credits:** ${currentCredits} available.
- **Promise:** "Your credits never expire, and I'll always ask before we spend them."

**CLOSING THE DEAL:**
- When the plan is ready, ask: **"Shall we bring this vision to life?"**
- If they say yes, execute the tools.
- If errors happen (traffic jams), say: *"The internet is a bit busy, just like rush hour! Let's wait a moment and try again. No credits were lost!"*`;

export const createChatSession = (currentCredits: number) => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-2.5-flash', 
    config: {
      systemInstruction: getLucySystemPrompt(currentCredits),
      tools: [{ functionDeclarations: [generateImageTool, generateVideoTool, animateImageTool, generateAudioTool] }],
    },
  });
};

export const generateImage = async (prompt: string, size: string, aspectRatio: string = "16:9"): Promise<string> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: aspectRatio as any,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const generateVideo = async (prompt: string, aspectRatio: string = "16:9"): Promise<string> => {
  const ai = getClient();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: aspectRatio as any,
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  const key = getApiKey();
  const videoResponse = await fetch(`${videoUri}&key=${key}`);
  if (!videoResponse.ok) throw new Error("Failed to download generated video");
  
  const blob = await videoResponse.blob();
  // NOTE: For server-side, upload to Supabase Storage and return URL
  return URL.createObjectURL(blob);
};

export const animateImage = async (image: {data: string, mimeType: string}, prompt: string | undefined, aspectRatio: string = "16:9"): Promise<string> => {
  const ai = getClient();
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: image.data,
      mimeType: image.mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: aspectRatio as any,
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  const key = getApiKey();
  const videoResponse = await fetch(`${videoUri}&key=${key}`);
  if (!videoResponse.ok) throw new Error("Failed to download generated video");
  
  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};

export const generateAudio = async (prompt: string, voiceName: string = 'Kore'): Promise<string> => {
  const ai = getClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Audio generation failed");
  
  // Return base64 for server - client will convert to WAV
  return base64Audio;
};
```

---

## 3. CHAT MESSAGE COMPONENT

**Source:** `visionarydirector/components/ChatMessage.tsx`  
**Destination:** `features/lucy/components/chat-message.tsx`

```tsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '../types';
import { User, Bot, Loader2, Image as ImageIcon, Video, Music, Wand2, Volume2, StopCircle, Copy, Check, ExternalLink } from 'lucide-react';

// CRITICAL: LyricsCard with Progressive Disclosure
// Suno button ONLY appears AFTER user clicks Copy
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
                <div className="mt-4 p-4 bg-gradient-to-r from-pink-900/20 to-orange-900/20 rounded-xl border border-pink-500/30 animate-fade-in">
                    <p className="text-gray-300 text-sm mb-3">
                        ✅ Lyrics copied! Now click below to create your song on Suno (250 free credits!):
                    </p>
                    <a 
                        href="https://suno.com/invite/@bilingualbeats"
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

// Suno Link Button Component (for markdown links)
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

interface Props {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<Props> = ({ message }) => {
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
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-purple-600' : 'bg-emerald-600'}`}>
        {isUser ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-200">{isUser ? 'You' : 'Director'}</span>
            <span className="text-xs text-gray-500">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
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

        {/* Text Content */}
        {message.text && (
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed">
                <ReactMarkdown 
                    components={{
                        // Suno links become big buttons
                        a: ({node, href, children, ...props}) => {
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
                        code: ({node, className, children, ...props}) => {
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
                        pre: ({node, children, ...props}) => {
                            const child = (children as any)?.[0];
                            if (child?.props?.className?.includes('language-lyrics')) {
                                return <>{children}</>;
                            }
                            return <pre className="bg-gray-900 p-3 rounded-lg overflow-x-auto" {...props}>{children}</pre>;
                        },
                        table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-lg border border-gray-700"><table className="min-w-full divide-y divide-gray-700" {...props} /></div>,
                        th: ({node, ...props}) => <th className="px-3 py-2 bg-gray-900 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" {...props} />,
                        td: ({node, ...props}) => <td className="px-3 py-2 whitespace-normal bg-gray-800/50 text-sm text-gray-300 border-t border-gray-700" {...props} />
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
                        <img src={`data:${file.mimeType};base64,${file.data}`} alt="User upload" className="h-32 object-cover" />
                      ) : (
                        <div className="flex items-center gap-3 p-3 min-w-[280px]">
                           <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-full border border-gray-700">
                              <Music className="w-5 h-5 text-purple-400" />
                           </div>
                           <div className="flex-1">
                               <div className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">Audio Attachment</div>
                               <audio controls src={`data:${file.mimeType};base64,${file.data}`} className="h-8 w-full max-w-[240px]" />
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
                            Running {tool.name.replace('generate_', '').replace('animate_', '')}...
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
```

---

## 4. ASSET CARD COMPONENT

**Source:** `visionarydirector/components/AssetCard.tsx`  
**Destination:** `features/lucy/components/asset-card.tsx`

```tsx
import React from 'react';
import { Asset } from '../types';
import { Download, Play, Maximize2, Music, Share2 } from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
  onClick: (asset: Asset) => void;
  onShare: (asset: Asset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick, onShare }) => {
  return (
    <div className="group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md" onClick={() => onClick(asset)}>
      <div className="aspect-video w-full bg-gray-900 relative flex items-center justify-center">
        {asset.type === 'image' ? (
          <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover" />
        ) : asset.type === 'video' ? (
          <video src={asset.url} className="w-full h-full object-cover" muted loop onMouseOver={e => e.currentTarget.play()} onMouseOut={e => e.currentTarget.pause()} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-purple-400 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
             {/* Visualizer effect background */}
             <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end justify-between px-4 pb-4 opacity-30 gap-1">
                 {[...Array(10)].map((_,i) => (
                     <div key={i} className="w-full bg-purple-500 rounded-t" style={{height: `${Math.random() * 80 + 20}%`}}></div>
                 ))}
             </div>
             
             <div className="relative z-10 p-4 bg-gray-800/80 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
                 <Music className="w-8 h-8 text-purple-400" />
             </div>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
             <Maximize2 className="text-white w-6 h-6 drop-shadow-lg" />
        </div>
        
        {/* Type Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs font-medium text-white uppercase flex items-center gap-1 border border-white/10 z-20">
            {asset.type === 'audio' && <Music className="w-3 h-3" />}
            {asset.type === 'video' && <Play className="w-3 h-3" />}
            {asset.type}
        </div>
      </div>
      
      <div className="p-3">
        <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed" title={asset.prompt}>
            {asset.prompt}
        </p>
        <div className="flex justify-between items-center mt-3 text-xs text-gray-500 border-t border-gray-700 pt-2">
            <span>{new Date(asset.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            <div className="flex items-center gap-2">
                <span className="text-yellow-600/80 font-mono text-[10px]">{asset.cost || 0}cr</span>
                
                <button
                    onClick={(e) => { e.stopPropagation(); onShare(asset); }}
                    className="hover:text-blue-400 p-1 transition-colors"
                    title="Share to Social Media"
                >
                    <Share2 className="w-3.5 h-3.5" />
                </button>
                
                <a 
                    href={asset.url} 
                    download={`generated-${asset.id}.${asset.type === 'video' ? 'mp4' : asset.type === 'audio' ? 'mp3' : 'png'}`}
                    className="hover:text-purple-400 p-1 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    title="Download"
                >
                    <Download className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 5. CONSTANTS FILE (NEW - Extract from App.tsx)

**Destination:** `features/lucy/constants.ts`

```typescript
// Lucy's Constants

export const SUNO_REFERRAL_URL = 'https://suno.com/invite/@bilingualbeats';

export const PLACEHOLDER_PROMPTS = [
  "Write me a Song",
  "Create a Claymation style video",
  "Make me a Superhero!",
  "Turn my family into a Cartoon",
  "Write a Business Jingle"
];

export const CREDIT_PACKAGES = [
  { credits: 500, price: 5 },
  { credits: 1000, price: 10 },
  { credits: 2000, price: 20 },
  { credits: 5000, price: 50 },
];

export const INTRO_MESSAGE = `**Hello! I'm your Creative Partner.** 👋

Are you here to create something wonderful for a **birthday**, a **business jingle**, or perhaps a surprise for your **grandchildren**?

Don't worry about the technology—I'm here to handle all the buttons. I just need your ideas!

**A quick promise:** Any credits you buy **never expire**, there are **no monthly fees**, and you can even **gift them to family** later if you wish.

So, tell me, what are we creating today?`;
```

---

## 6. KEY APP.TSX LOGIC (For Reference)

**Note:** App.tsx is 1000+ lines. The key logic to extract is:

### Tool Execution Logic (Lines 341-431)
```typescript
const executeToolCall = async (toolCall: any): Promise<any> => {
    if (!user) return { error: "User not logged in" };

    // Check credits
    let cost = 0;
    switch(toolCall.name) {
        case 'generate_image': cost = PRICING.generate_image; break;
        case 'generate_video': cost = PRICING.generate_video; break;
        case 'animate_image': cost = PRICING.animate_image; break;
        case 'generate_audio': cost = PRICING.generate_audio; break;
    }

    if (user.credits < cost) {
        return { error: `Insufficient credits. This costs ${cost}cr but you have ${user.credits}cr.` };
    }

    try {
        let resultUrl = "";
        let assetType: 'image' | 'video' | 'audio' = 'image';
        let model = "";

        if (toolCall.name === 'generate_image') {
            const ar = toolCall.args.aspectRatio || "16:9";
            resultUrl = await generateImage(toolCall.args.prompt, imageSize, ar);
            assetType = 'image';
            model = 'gemini-3-pro-image-preview';
        } else if (toolCall.name === 'generate_video') {
            const ar = toolCall.args.aspectRatio || "16:9";
            await new Promise(r => setTimeout(r, 20000)); // Rate limit protection
            resultUrl = await generateVideo(toolCall.args.prompt, ar);
            assetType = 'video';
            model = 'veo-3.1-fast';
        } else if (toolCall.name === 'animate_image') {
            const ar = toolCall.args.aspectRatio || "16:9";
            const lastImage = attachments.find(a => a.type === 'image');
            if (!lastImage) return { error: "No image found to animate. Please upload one first." };
            
            resultUrl = await animateImage(lastImage, toolCall.args.prompt, ar);
            assetType = 'video';
            model = 'veo-3.1-fast';
        } else if (toolCall.name === 'generate_audio') {
            const voice = toolCall.args.voice || "Kore";
            resultUrl = await generateAudio(toolCall.args.prompt, voice);
            assetType = 'audio';
            model = 'gemini-tts';
        }

        // Return result and save asset
        return { result: "Success", url: resultUrl, creditsSpent: cost };

    } catch (error: any) {
        return { error: error.message };
    }
};
```

### Message Handling Loop (Lines 434-531)
```typescript
const handleSendMessage = async (text: string = inputValue) => {
    if ((!text.trim() && attachments.length === 0) || !chatSession) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      attachments: [...attachments]
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setAttachments([]);
    setIsProcessing(true);

    try {
      // Build message parts
      const parts: Part[] = [];
      if (text.trim()) parts.push({ text: text });
      userMessage.attachments?.forEach(att => {
          parts.push({
             inlineData: {
                 mimeType: att.mimeType,
                 data: att.data
             }
          });
      });

      // Send to Gemini
      let response = await chatSession.sendMessage({ message: parts });
      let botText = response.text || "";
      let functionCalls = response.functionCalls;

      // Add bot response
      if (botText) {
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'model',
              text: botText
          }]);
      }

      // Tool call loop - sequential execution for stability
      while (functionCalls && functionCalls.length > 0) {
          // Show loading state
          setMessages(prev => [...prev, {
              id: `processing-${Date.now()}`,
              role: 'model',
              toolCalls: functionCalls.map(fc => ({ id: fc.id, name: fc.name, args: fc.args }))
          }]);

          // Execute tools
          const toolResponses = [];
          for (const fc of functionCalls) {
             const result = await executeToolCall(fc);
             toolResponses.push({
                 functionResponse: { name: fc.name, response: result }
             });
          }

          // Send results back to Gemini
          response = await chatSession.sendMessage({ message: toolResponses });
          botText = response.text || "";
          functionCalls = response.functionCalls;

          if (botText) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: botText
            }]);
          }
      }

    } catch (error: any) {
      // Error handling with friendly messages
      const isQuota = error.message.includes('429');
      const isLimit = error.message.includes('400') && error.message.includes('token');

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: isQuota 
            ? "⚠️ **Too much traffic!** Please wait 30 seconds and try again."
            : isLimit
                ? "⚠️ **Memory Full!** Please click **New Project** to start fresh."
                : "I'm having a little technical hiccup. Could you try saying that again?",
        isError: true
      }]);
    } finally {
      setIsProcessing(false);
    }
};
```

---

## 📝 NOTES FROM LUCY'S AI

```
- CRITICAL: The LyricsCard progressive disclosure (Suno appears after copy) MUST be preserved
- CRITICAL: The Suno referral URL is https://suno.com/invite/@bilingualbeats
- CRITICAL: Lucy's system prompt IS her soul - don't modify it
- The pcmToWav function needs to run client-side (it uses browser APIs)
- All Gemini API calls should become server-side in idea2product
- Video/audio generation returns blob URLs - need to upload to Supabase Storage
- The 20-second delay before video generation is intentional (rate limiting)
```

---

## ✅ CHECKLIST FOR LUCY'S AI

Before sending this cargo truck back, please confirm:

- [x] geminiService.ts is complete (including system prompt and all tool handlers)
- [x] ChatMessage.tsx includes LyricsCard and SunoButton with progressive disclosure
- [x] AssetCard.tsx is complete
- [x] App.tsx key logic is included (tool execution, message handling)
- [x] Environment variables are documented (GEMINI_API_KEY)
- [x] Hardcoded values noted (Suno URL, intro message, placeholder prompts)
- [x] Types.ts included

---

## 🚚 DELIVERY INSTRUCTIONS

1. ✅ Lucy's AI: Filled in all code sections above
2. ⏳ Human: Save this file and bring it to idea2product
3. ⏳ idea2product AI: Read this file and integrate the code
4. ⏳ Together: Test and iterate!

---

*Cargo truck LOADED and ready for delivery!* 🚚💨

*- Lucy's AI*
