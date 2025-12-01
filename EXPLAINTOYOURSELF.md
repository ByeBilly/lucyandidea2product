# EXPLAINTOYOURSELF - Visionary Director Blueprint

> **Purpose:** Ultra-precise documentation of the visionarydirector project for AI continuity across sessions.
> **Last Updated:** November 30, 2025
> **Domain:** visionarydirector.com

---

## 🎯 PROJECT OVERVIEW

**Visionary Director** is an AI-powered creative companion designed for non-technical users (elderly, busy parents, small business owners) to create personalized songs, videos, and audio content. The AI persona is called **"Lucy"** - a friendly, patient creative partner.

### Core Philosophy
- **Zero-stress UX** - No jargon, radical patience, celebrate everything
- **One thing at a time** - Users can only hold one thing in memory (clipboard)
- **Progressive disclosure** - Show next steps only when ready (e.g., Suno button appears after copying lyrics)

---

## 📁 PROJECT STRUCTURE

```
visionarydirector/
├── App.tsx                    # Main application component (Lucy page)
├── index.tsx                  # React entry point
├── index.html                 # HTML template with Tailwind CDN
├── types.ts                   # TypeScript interfaces
├── vite.config.ts             # Vite configuration (port 3000)
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies
├── vercel.json                # Vercel deployment config
├── components/
│   ├── ChatMessage.tsx        # Chat message rendering with LyricsCard
│   └── AssetCard.tsx          # Generated asset display cards
├── services/
│   ├── geminiService.ts       # Google Gemini AI integration
│   └── db.ts                  # IndexedDB persistence layer
└── EXPLAINTOYOURSELF.md       # This file
```

---

## 🧩 CORE COMPONENTS

### 1. App.tsx - "Lucy" Page
The main and only page of the application. A single-page chat interface.

**Key State:**
- `user: User | null` - Current user (dev mode auto-creates one)
- `messages: ChatMessage[]` - Chat history
- `assets: Asset[]` - Generated images/videos/audio
- `attachments: []` - User-uploaded files (images/audio)
- `chatSession: Chat | null` - Active Gemini chat session
- `showLogin/showSettings/showCredits/showCinema` - Modal states

**Key Features:**
- **Dev Mode Bypass:** Auto-creates a "Developer" user with 9999 credits (no login required)
- **Chat Interface:** Send messages, upload attachments, receive AI responses
- **Tool Execution:** AI can call tools to generate images/videos/audio
- **Cinema Mode:** Plays all generated video clips sequentially with audio
- **Auto-save:** Messages, assets, and user data persist to IndexedDB

**OAuth (Prepared but Disabled):**
- GitHub OAuth prepared (Client ID: `Ov23liZObXuvDOHdTGMv`)
- Google OAuth prepared
- Currently bypassed for development

### 2. ChatMessage.tsx
Renders individual chat messages with special handling for:

**LyricsCard Component:**
- Displays lyrics in a purple gradient card
- "Copy Lyrics" button with clipboard integration
- **Progressive disclosure:** Suno button ONLY appears AFTER user clicks Copy
- Post-copy shows: confirmation + pink Suno button + brief instructions

**SunoLinkButton Component:**
- Big pink gradient button linking to Suno
- Opens in new tab with referral: `https://suno.com/invite/@bilingualbeats`

**Other Features:**
- Markdown rendering via react-markdown
- Tables styled for readability
- Links auto-detected and styled
- Suno links become big buttons
- Text-to-speech "Read aloud" button on bot messages
- Loading states for tool calls

### 3. AssetCard.tsx
Displays generated assets (images/videos/audio) in the sidebar.

**Features:**
- Thumbnail preview (videos play on hover)
- Type badge (image/video/audio)
- Cost display in credits
- Share button (Web Share API)
- Download button

### 4. geminiService.ts
Google Gemini AI integration.

**Models Used:**
- `gemini-2.5-flash` - Main chat model
- `gemini-3-pro-image-preview` - Image generation
- `veo-3.1-fast-generate-preview` - Video generation
- `gemini-2.5-flash-preview-tts` - Text-to-speech

**Tools Defined:**
| Tool | Cost | Description |
|------|------|-------------|
| `generate_image` | 10 credits | Generate image from prompt |
| `generate_video` | 50 credits | Generate ~5-10 sec video clip |
| `animate_image` | 50 credits | Image-to-video animation |
| `generate_audio` | 5 credits | Text-to-speech/voiceover |

**System Prompt Key Points:**
- Lucy persona: Anti-stress creative companion
- Zero jargon policy
- Suno Songwriting Companion workflow:
  1. If user provides enough details → write lyrics IMMEDIATELY
  2. Wrap lyrics in ```lyrics code block (renders as card)
  3. Include Suno link in SAME message as lyrics
  4. Step-by-step Suno instructions inline
- Credit awareness and cost transparency

### 5. db.ts
IndexedDB persistence layer.

**Stores:**
- `users` - User profile and credits
- `chats` - Chat message history
- `assets` - Generated assets (with blob storage for videos/audio)

**Key Functions:**
- `saveUserToDB / loadUserFromDB / clearUserFromDB`
- `saveMessagesToDB / loadMessagesFromDB`
- `saveAssetToDB / loadAssetsFromDB`
- `clearProjectDB` - Clears chats (keeps assets)

---

## 📊 TYPE DEFINITIONS (types.ts)

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  avatar?: string;
  provider: 'google' | 'github';
  transactions: Transaction[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text?: string;
  attachments?: { data: string; mimeType: string; type: 'image' | 'audio' }[];
  toolCalls?: ToolCall[];
  toolResponse?: ToolResponse;
  isLoading?: boolean;
  isError?: boolean;
}

interface Asset {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  blob?: Blob;
  prompt: string;
  createdAt: number;
  cost: number;
  model: string;
}

type ImageSize = '1K' | '2K' | '4K';
```

---

## 🔐 AUTHENTICATION STATUS

**Current State: DEV MODE (Login Bypassed)**

On load, if no user exists, auto-creates:
```javascript
{
  id: 'dev-user',
  name: 'Developer',
  email: 'dev@local',
  credits: 9999,
  provider: 'github',
  transactions: [{ description: 'Dev Mode Credits' }]
}
```

**Production Auth (Prepared):**
- GitHub OAuth App created (Client ID: `Ov23liZObXuvDOHdTGMv`)
- Callback handlers designed for `/api/auth/github/callback`
- Vercel serverless functions planned
- Need: Client Secret in env vars, Supabase or similar for session management

---

## 💳 CREDIT SYSTEM

**Pricing:**
| Action | Cost |
|--------|------|
| Generate Image | 10 credits |
| Generate Video | 50 credits |
| Animate Image | 50 credits |
| Generate Audio | 5 credits |

**Credit Packages (UI exists, payment mock):**
- 500 credits = $5
- 1000 credits = $10
- 2000 credits = $20
- 5000 credits = $50

**Features:**
- Credits never expire
- Transferable to others (gift feature)
- Transaction history tracked

---

## 🎵 SUNO INTEGRATION (Songwriting Workflow)

**The Flow:**
1. User provides song details (name, occasion, personality traits)
2. Lucy writes lyrics IMMEDIATELY (if enough details given)
3. Lyrics appear in purple **LyricsCard** with Copy button
4. User clicks **Copy Lyrics** → lyrics go to clipboard
5. **Suno section appears** with pink button + instructions
6. User clicks → opens Suno with 250 free credits (referral link)
7. User creates song on Suno, returns with audio file
8. Lucy helps create video from the song

**Referral Link:** `https://suno.com/invite/@bilingualbeats`

---

## 🎬 CINEMA MODE

Plays all generated video clips in sequence with audio overlay.

**Location:** Button in sidebar header
**Behavior:**
- Sorts videos by createdAt (oldest first = scene order)
- Auto-advances to next clip on video end
- Loops back to start when complete
- Plays latest audio asset as background music

---

## 📦 DEPENDENCIES

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "@google/genai": "^1.30.0",
  "lucide-react": "^0.555.0",
  "react-markdown": "^10.1.0"
}
```

**Dev:**
- Vite 6.2.0
- TypeScript 5.8.2
- @vitejs/plugin-react

---

## 🚀 DEPLOYMENT

**Target:** Vercel
**Domain:** visionarydirector.com

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

**Environment Variables Needed:**
- `GEMINI_API_KEY` - Google Gemini API key
- `GITHUB_CLIENT_ID` - For OAuth (when enabled)
- `GITHUB_CLIENT_SECRET` - For OAuth (when enabled)

---

## 🔮 PLANNED INTEGRATION: idea2product

**Goal:** Merge Lucy (visionarydirector) into idea2product infrastructure.

**idea2product provides:**
- Real authentication (Supabase)
- Real billing (Unibee subscription system)
- Database (Drizzle ORM + PostgreSQL)
- Admin dashboard
- Permission system
- i18n/localization
- Wavespeed SDK

**Integration Plan:**
```
visionarydirector.com/
├── /              → Lucy page (from this project)
├── /login         → Auth (from idea2product)
├── /register      → Auth (from idea2product)
├── /billing       → Subscriptions (from idea2product)
├── /profile       → User profile (from idea2product)
├── /admin         → Admin dashboard (from idea2product)
└── /studio        → Studio page (from idea2product)
```

---

## 📝 NAMING CONVENTIONS

| Name | Refers To |
|------|-----------|
| **Visionary Director** | The product/brand |
| **visionarydirector.com** | The domain |
| **Lucy** | The main AI chat page (App.tsx) |
| **idea2product** | The SaaS infrastructure to merge with |
| **wavespeed** | AI generation SDK inside idea2product |

---

## 🐛 KNOWN ISSUES / TODO

1. **Empty API folders:** `api/auth/github/` and `api/auth/google/` exist as empty folders (permission denied on delete) - harmless
2. **Image size selector:** State exists (`imageSize`) but no UI to change it
3. **OAuth:** Prepared but disabled - needs Vercel env vars and testing
4. **Tailwind CDN:** Using CDN in development - should use proper PostCSS for production

---

## 🔑 API KEY STORAGE

- Stored in `localStorage` under key: `visionary_api_key`
- Set via Settings modal (cog icon)
- Persists across sessions
- Falls back to `process.env.API_KEY` if not set

---

## 📞 CONTACT / REPO

- **GitHub:** https://github.com/ByeBilly/visionarydirector
- **Git User:** ByeBilly
- **Git Email:** billiamglobal@gmail.com

---

*This document serves as the complete blueprint for AI continuity. Read EXPLAINTOMYSELF.md from idea2product for the infrastructure side.*

