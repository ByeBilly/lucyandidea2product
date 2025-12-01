/**
 * Lucy Feature - Constants
 * Contains Lucy's persona, pricing, and configuration
 */

// ============================================
// PRICING (in credits)
// ============================================

export const LUCY_PRICING = {
  generate_image: 10,
  generate_video: 50,
  animate_image: 50,
  generate_audio: 5,
} as const;

// ============================================
// CREDIT PACKAGES (for future billing integration)
// ============================================

export const CREDIT_PACKAGES = [
  { credits: 500, price: 5 },
  { credits: 1000, price: 10 },
  { credits: 2000, price: 20 },
  { credits: 5000, price: 50 },
] as const;

// ============================================
// GEMINI MODELS
// ============================================

export const LUCY_MODELS = {
  chat: 'gemini-2.5-flash',
  image: 'gemini-3-pro-image-preview',
  video: 'veo-3.1-fast-generate-preview',
  tts: 'gemini-2.5-flash-preview-tts',
} as const;

// ============================================
// SUNO INTEGRATION
// ============================================

export const SUNO_REFERRAL_URL = process.env.LUCY_SUNO_REFERRAL_URL || 'https://suno.com/invite/@bilingualbeats';

// ============================================
// PLACEHOLDER PROMPTS
// ============================================

export const LUCY_PLACEHOLDER_PROMPTS = [
  "Write me a Song",
  "Create a Claymation style video",
  "Make me a Superhero!",
  "Turn my family into a Cartoon",
  "Write a Business Jingle",
] as const;

// ============================================
// INTRO MESSAGE
// ============================================

export const LUCY_INTRO_MESSAGE = `**Hello! I'm your Creative Partner.** 👋

Are you here to create something wonderful for a **birthday**, a **business jingle**, or perhaps a surprise for your **grandchildren**?

Don't worry about the technology—I'm here to handle all the buttons. I just need your ideas!

**A quick promise:** Any credits you buy **never expire**, there are **no monthly fees**, and you can even **gift them to family** later if you wish.

So, tell me, what are we creating today?`;

// ============================================
// VOICE OPTIONS
// ============================================

export const LUCY_VOICE_OPTIONS = [
  { value: 'Puck', label: 'Puck (Playful)' },
  { value: 'Charon', label: 'Charon (Deep)' },
  { value: 'Kore', label: 'Kore (Warm)' },
  { value: 'Fenrir', label: 'Fenrir (Bold)' },
] as const;

// ============================================
// ASPECT RATIOS
// ============================================

export const IMAGE_ASPECT_RATIOS = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '3:4', label: 'Portrait (3:4)' },
  { value: '4:3', label: 'Landscape (4:3)' },
  { value: '9:16', label: 'Vertical (9:16)' },
  { value: '16:9', label: 'Widescreen (16:9)' },
] as const;

export const VIDEO_ASPECT_RATIOS = [
  { value: '16:9', label: 'Widescreen (16:9)' },
  { value: '9:16', label: 'Vertical (9:16)' },
] as const;

// ============================================
// LUCY'S SYSTEM PROMPT - THE SOUL OF LUCY
// ============================================

export const LUCY_SYSTEM_PROMPT = `You are the Visionary Director AI, a friendly creative companion designed for non-technical users. Your name is Lucy.

## YOUR PERSONALITY
- You are patient, encouraging, and celebrate every small win
- You NEVER use technical jargon
- You speak like a supportive friend, not a robot
- You keep things simple - one step at a time
- You're enthusiastic about creativity

## ZERO-STRESS PRINCIPLES
1. **One thing at a time** - Never overwhelm with options
2. **Celebrate everything** - Even small progress is amazing
3. **No jargon** - If a 70-year-old grandma wouldn't understand it, rephrase it
4. **Radical patience** - Repeat yourself kindly if needed

## SUNO SONGWRITING WORKFLOW
When helping users create songs:

1. **Gather Details First** (if not provided):
   - Who is the song for?
   - What's the occasion?
   - What are they like? (personality, interests)
   - Any specific memories or inside jokes?
   - What mood/style? (happy, touching, funny, etc.)

2. **Write Lyrics IMMEDIATELY** when you have enough details:
   - Don't ask "shall I write the lyrics?" - just do it
   - Wrap lyrics in a \`\`\`lyrics code block
   - Keep songs 2-3 verses + chorus
   - Make them personal and meaningful

3. **Include Suno Link** in the SAME message as lyrics:
   - After the lyrics, mention they can create the actual song on Suno
   - They get 250 free credits with the referral link
   - Keep instructions brief and friendly

## TOOL USAGE
You have access to these creative tools:

- **generate_image** (${LUCY_PRICING.generate_image} credits) - Create images from descriptions
- **generate_video** (${LUCY_PRICING.generate_video} credits) - Create short video clips (~5-10 sec)
- **animate_image** (${LUCY_PRICING.animate_image} credits) - Bring an uploaded image to life
- **generate_audio** (${LUCY_PRICING.generate_audio} credits) - Create voiceovers

When using tools:
- Always mention the cost before generating
- Be descriptive with prompts for better results
- For videos, think in SHORT CLIPS - one scene at a time

## CINEMA MODE
If users have multiple video clips, remind them about Cinema Mode - it plays all their clips together with audio as a mini-movie!

## REMEMBER
Your users might be:
- Elderly grandparents making something for grandkids
- Busy parents with no time to learn complex tools
- Small business owners wanting simple content
- Anyone who finds technology intimidating

Be their patient, creative friend. Make magic feel easy. 💜`;

// ============================================
// TOOL DEFINITIONS FOR GEMINI
// ============================================

export const LUCY_TOOL_DEFINITIONS = [
  {
    name: 'generate_image',
    description: `Generate an image from a text description. COST: ${LUCY_PRICING.generate_image} credits. Use vivid, detailed prompts for best results.`,
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Detailed description of the image to generate',
        },
        aspectRatio: {
          type: 'string',
          enum: ['1:1', '3:4', '4:3', '9:16', '16:9'],
          description: 'Aspect ratio for the image',
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'generate_video',
    description: `Generate a SINGLE short video clip (~5-10 seconds). COST: ${LUCY_PRICING.generate_video} credits PER CLIP. For longer content, generate multiple clips that can be played together in Cinema Mode.`,
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Description of the video scene to generate',
        },
        aspectRatio: {
          type: 'string',
          enum: ['16:9', '9:16'],
          description: 'Aspect ratio for the video',
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'animate_image',
    description: `Animate an uploaded image to create a video. COST: ${LUCY_PRICING.animate_image} credits. The user must have uploaded an image first.`,
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Optional description of how to animate the image',
        },
        aspectRatio: {
          type: 'string',
          enum: ['16:9', '9:16'],
          description: 'Aspect ratio for the output video',
        },
      },
      required: ['aspectRatio'],
    },
  },
  {
    name: 'generate_audio',
    description: `Generate a voiceover or spoken audio. COST: ${LUCY_PRICING.generate_audio} credits. Great for narration or adding voice to videos.`,
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The text to speak or describe what to say',
        },
        voice: {
          type: 'string',
          enum: ['Puck', 'Charon', 'Kore', 'Fenrir'],
          description: 'Voice style to use',
        },
      },
      required: ['prompt'],
    },
  },
];


