/**
 * Lucy Feature - Gemini AI Service
 * Server-side Gemini integration for Lucy's creative capabilities
 * 
 * ⚠️ This file runs SERVER-SIDE ONLY - no browser APIs
 */

import { GoogleGenAI, FunctionDeclaration, Type, Modality } from "@google/genai";

// ============================================
// PRICING (in credits)
// ============================================

export const PRICING = {
  generate_image: 10,
  generate_video: 50,
  animate_image: 50,
  generate_audio: 5,
} as const;

// ============================================
// CLIENT INITIALIZATION
// ============================================

const getApiKey = (): string => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return key;
};

const getClient = (): GoogleGenAI => {
  return new GoogleGenAI({ apiKey: getApiKey() });
};

// ============================================
// TOOL DEFINITIONS
// ============================================

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

export const ALL_TOOLS = [generateImageTool, generateVideoTool, animateImageTool, generateAudioTool];

// ============================================
// LUCY'S SYSTEM PROMPT - HER SOUL! 💜
// ============================================

export const getLucySystemPrompt = (currentCredits: number): string => `You are the Visionary Director AI, but more importantly, you are an **Anti-Stress Creative Companion**.

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

// ============================================
// CHAT SESSION
// ============================================

export const createChatSession = (currentCredits: number) => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getLucySystemPrompt(currentCredits),
      tools: [{ functionDeclarations: ALL_TOOLS }],
    },
  });
};

// ============================================
// GENERATION FUNCTIONS
// ============================================

/**
 * Generate an image using Gemini
 * @returns Base64 data URL of the generated image
 */
export const generateImage = async (
  prompt: string,
  size: string = "1024x1024",
  aspectRatio: string = "16:9"
): Promise<{ data: string; mimeType: string }> => {
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
      return {
        data: part.inlineData.data!,
        mimeType: part.inlineData.mimeType || 'image/png',
      };
    }
  }
  throw new Error("No image generated");
};

/**
 * Generate a video using Gemini/Veo
 * @returns Video as a Blob (needs to be uploaded to storage)
 */
export const generateVideo = async (
  prompt: string,
  aspectRatio: string = "16:9"
): Promise<Blob> => {
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

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  // Download the video
  const key = getApiKey();
  const videoResponse = await fetch(`${videoUri}&key=${key}`);
  if (!videoResponse.ok) throw new Error("Failed to download generated video");

  return await videoResponse.blob();
};

/**
 * Animate an image to create a video
 * @returns Video as a Blob (needs to be uploaded to storage)
 */
export const animateImage = async (
  image: { data: string; mimeType: string },
  prompt: string | undefined,
  aspectRatio: string = "16:9"
): Promise<Blob> => {
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

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");

  // Download the video
  const key = getApiKey();
  const videoResponse = await fetch(`${videoUri}&key=${key}`);
  if (!videoResponse.ok) throw new Error("Failed to download generated video");

  return await videoResponse.blob();
};

/**
 * Generate audio/speech using Gemini TTS
 * @returns Base64 PCM audio data (needs client-side conversion to WAV)
 */
export const generateAudio = async (
  prompt: string,
  voiceName: string = 'Kore'
): Promise<string> => {
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

  return base64Audio;
};

// ============================================
// TYPES FOR CHAT
// ============================================

export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiFunctionCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface GeminiChatResponse {
  text?: string;
  functionCalls?: GeminiFunctionCall[];
}




