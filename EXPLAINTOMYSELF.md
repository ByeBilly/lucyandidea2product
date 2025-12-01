# IDEA2PRODUCT Platform Blueprint
## A Comprehensive Technical Overview for Cross-Platform Integration

**Document Purpose:** This document serves as a complete architectural blueprint of the idea2product platform, designed to facilitate understanding for merging with the Lucy Page (formerly VisionaryDirector) platform.

---

## 1. PLATFORM IDENTITY & PURPOSE

### What is idea2product?
An **AI-powered SaaS startup template** built for rapid deployment of AI tool applications. The platform provides:
- User authentication & authorization
- Subscription/billing management
- AI model integration (primarily image/video generation)
- Task queue management with async processing
- Admin dashboard for platform management
- Multi-language internationalization (i18n)

### Core Value Proposition
Turn AI API capabilities into a monetizable SaaS product with minimal setup time. The template handles all the "boring" infrastructure so developers can focus on AI features.

---

## 2. TECHNOLOGY STACK

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.4.0-canary.47 | React framework with App Router |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5.8.3 | Type safety |
| **Tailwind CSS** | 4.1.7 | Utility-first styling |
| **Radix UI** | Various | Accessible UI primitives |
| **Lucide React** | 0.511.0 | Icon library |
| **SWR** | 2.3.3 | Data fetching/caching |
| **React Hook Form** | 7.56.4 | Form management |
| **Zod** | 3.24.4 | Schema validation |
| **Recharts** | 2.15.3 | Data visualization |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js Server Actions** | Server-side mutations |
| **Drizzle ORM** | 0.43.1 - Type-safe database queries |
| **PostgreSQL** | Primary database (via Supabase) |
| **Supabase Auth** | Authentication provider |
| **Redis/Memory Cache** | Server-side caching |

### External Services
| Service | Purpose |
|---------|---------|
| **Supabase** | Auth + PostgreSQL database hosting |
| **Stripe** | Payment processing |
| **Unibee** | Alternative billing/subscription management |
| **WaveSpeed AI** | AI model API provider (80+ models) |

---

## 3. PROJECT STRUCTURE

```
s:\dev\idea2product\
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes
│   │   ├── (auth)/              # Auth pages (login, register, etc.)
│   │   ├── (billing)/           # Subscription pages
│   │   ├── (dashboard)/         # User dashboard & profile
│   │   ├── (studio)/            # AI tool studio (empty - ready for customization)
│   │   ├── admin/               # Admin panel
│   │   └── task/                # Task history & results
│   ├── actions/                  # Server Actions (API layer)
│   │   ├── auth/                # Authentication actions
│   │   ├── billing/             # Subscription/payment actions
│   │   ├── permission/          # Role/permission management
│   │   ├── task/                # Task management
│   │   ├── tool/                # AI tool invocation
│   │   └── unibee/              # Unibee billing integration
│   ├── api/                      # API routes (webhooks)
│   ├── globals.css              # Global styles with CSS variables
│   └── layout.tsx               # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI primitives (shadcn/ui style)
│   ├── admin/                   # Admin-specific components
│   ├── billing/                 # Billing components
│   ├── subscription/            # Subscription management
│   └── task/                    # Task display components
├── lib/                          # Core library code
│   ├── auth/                    # Auth utilities & hooks
│   ├── cache/                   # Caching service
│   ├── db/                      # Database layer
│   │   ├── crud/                # CRUD operations
│   │   ├── migrations/          # Database migrations
│   │   └── schemas/             # Drizzle table schemas
│   ├── events/                  # Event bus system
│   ├── mappers/                 # DTO mappers
│   ├── permission/              # Permission system
│   ├── supabase/                # Supabase client setup
│   ├── types/                   # TypeScript type definitions
│   └── unibee/                  # Unibee API client
├── sdk/                          # External API SDKs
│   └── wavespeed/               # WaveSpeed AI SDK (83 AI models)
├── i18n/                         # Internationalization
│   ├── en/                      # English translations (136 files)
│   └── zh-CN/                   # Chinese translations
├── config/                       # Generated configurations
│   └── permission.merge.json    # Auto-merged permissions
└── scripts/                      # Build-time scripts
```

---

## 4. DATABASE SCHEMA

### Core Tables

#### Authentication & Users
```typescript
// profiles - User profile data
{
  id: uuid (PK, links to Supabase auth.users),
  email: text (unique, required),
  roles: text[] (array of role names),
  username: varchar(50),
  full_name: varchar(100),
  avatar_url: text,
  email_verified: boolean,
  active_2fa: boolean,
  subscription: text[] (active subscription types),
  unibeeExternalId: text,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt: timestamp (soft delete)
}
```

#### Permission System
```typescript
// roles - User roles
{
  id: uuid (PK),
  name: text (unique) - e.g., 'admin', 'user', 'system_admin',
  role_type: enum ('system', 'user'),
  description: text
}

// permission_configs - Permission definitions
{
  id: uuid (PK),
  key: text - e.g., 'PAGE@/admin', 'ACTION@createUser',
  target: text,
  scope: enum ('page', 'api', 'action', 'component'),
  auth_status: enum ('anonymous', 'authenticated'),
  active_status: enum ('inactive', 'active', 'active_2fa'),
  subscription_types: text[],
  reject_action: enum ('redirect', 'throw', 'hide'),
  title: text,
  description: text
}

// role_permissions - Role-Permission mapping
{
  id: uuid (PK),
  roleId: uuid (FK -> roles),
  permissionId: uuid (FK -> permission_configs)
}
```

#### Billing & Subscriptions
```typescript
// subscription_plans - Available plans
{
  id: uuid (PK),
  name: text,
  description: text,
  price: double,
  currency: text,
  billingCycle: enum ('day', 'week', 'month', 'year'),
  billingCount: integer,
  billingType: integer (1=recurring, 3=one-time),
  externalId: text,
  externalCheckoutUrl: text,
  isActive: boolean,
  metadata: jsonb
}

// user_subscription_plans - User subscriptions
// transactions - Payment records
// premium_packages - Add-on packages
// usage_records - Usage tracking
```

#### Task System
```typescript
// tasks - AI task queue
{
  id: uuid (PK),
  userId: uuid (FK -> profiles),
  parentTaskId: uuid (for chaining),
  type: text (model code),
  status: text ('pending', 'processing', 'completed', 'failed'),
  title: text,
  description: text,
  progress: integer (0-100),
  startedAt: timestamp,
  endedAt: timestamp,
  checkedAt: timestamp,
  checkInterval: integer (seconds),
  message: text,
  currentRequestAmount: integer,
  externalId: text (WaveSpeed task ID),
  externalMetricEventId: text (billing event ID)
}

// task_results - Generated outputs
{
  id: uuid (PK),
  userId: uuid (FK),
  taskId: uuid (FK -> tasks),
  type: text,
  status: enum ('pending', 'completed', 'failed'),
  content: text (small content),
  storageUrl: text (large content URL),
  mimeType: text,
  width: text,
  height: text,
  duration: text (video/audio),
  fileSize: text
}

// task_data - Input/output data storage
```

#### Unibee Integration
```typescript
// billable_metrics - Usage-based billing metrics
{
  id: uuid (PK),
  code: text,
  metricName: text,
  metricDescription: text,
  type: integer,
  aggregationType: integer,
  aggregationProperty: text,
  externalId: text
}

// user_metric_limits - Per-user usage limits
```

---

## 5. AUTHENTICATION SYSTEM

### Flow
1. **Supabase Auth** handles actual authentication (email/password, OAuth)
2. **Middleware** (`middleware.ts`) intercepts all requests:
   - Handles i18n locale detection
   - Validates session via Supabase
   - Checks route permissions
3. **UserContext** object passed through server actions:
```typescript
interface UserContext {
  id: string | null;
  roles: string[];
  authStatus: 'anonymous' | 'authenticated';
  activeStatus: 'inactive' | 'active' | 'active_2fa';
  subscription?: string[];
}
```

### Protected Routes
```typescript
// Public routes (no auth required)
["/", "/login", "/register", "/forgot-password", "/confirm", 
 "/auto-login", "/privacy", "/terms", "/subscribe-plan"]

// Admin routes (requires 'system_admin' role)
["/admin", "/admin/*"]

// All other routes require authentication
```

---

## 6. PERMISSION SYSTEM

### Architecture
The permission system uses a **distributed configuration** approach:

1. **Definition**: Permissions defined in `*.permission.json` files alongside business logic
2. **Collection**: Build-time script merges all permission files into `config/permission.merge.json`
3. **Sync**: Runtime service syncs config to database
4. **Enforcement**: Middleware and action guards check permissions

### Permission Scopes
| Scope | Key Format | Example |
|-------|------------|---------|
| PAGE | `PAGE@/path` | `PAGE@/admin/users` |
| API | `API@METHOD@/path` | `API@POST@/api/users` |
| ACTION | `ACTION@actionName` | `ACTION@createUser` |
| COMPONENT | `COMPONENT@name` | `COMPONENT@deleteButton` |

### Permission Config Structure
```json
{
  "permissions": {
    "action": {
      "createUser": {
        "title": "Create User",
        "description": "Create new user account",
        "authStatus": "authenticated",
        "activeStatus": "inactive",
        "rejectAction": "throw"
      }
    }
  }
}
```

### Action Permission Guard
```typescript
// Wrapping an action with permission check
export const myAction = dataActionWithPermission("actionName", async (data, userContext) => {
  // Action logic here
});
```

---

## 7. SERVER ACTIONS ARCHITECTURE

### Pattern
All server-side operations use Next.js Server Actions with a consistent pattern:

```typescript
// app/actions/module/action-name.ts
"use server";

import { dataActionWithPermission } from "@/lib/permission/guards/action";

export const actionName = dataActionWithPermission(
  "permissionKey",  // Links to permission config
  async (inputData: InputType, userContext: UserContext): Promise<ResultType> => {
    // Business logic
    // Database operations via lib/db/crud/*
    // Return typed result
  }
);
```

### Available Action Modules
| Module | Actions |
|--------|---------|
| **auth** | sign-in, sign-out, register, password reset, profile management |
| **billing** | subscription plans, checkout, transactions |
| **permission** | roles, permissions, sync |
| **task** | create, query, status check |
| **tool** | AI model invocation |
| **unibee** | billable metrics, user sync |

---

## 8. AI INTEGRATION (WaveSpeed SDK)

### Architecture
The platform integrates with **WaveSpeed AI** for AI model access:

```
sdk/wavespeed/
├── client.ts          # HTTP client for WaveSpeed API
├── base.ts            # Base classes for requests
├── types.ts           # TypeScript types
├── code-mapping.ts    # Model code to request class mapping
├── task-info-converter.ts  # Response transformation
└── requests/          # 83 model-specific request classes
```

### Supported AI Models (83 total)
**Image Generation:**
- Flux Dev/Schnell/Pro variants
- SDXL
- Imagen4
- HiDream

**Video Generation:**
- Hunyuan Video (T2V, I2V)
- Kling v1.6/v2.0
- WAN 2.1 (multiple variants)
- Veo2
- Minimax
- ByteDance Seedance

**Other:**
- Real-ESRGAN (upscaling)
- TTS (text-to-speech)
- 3D generation

### Request Pattern
```typescript
// Each model has a typed request class
export class FluxDevUltraFastRequest extends BaseRequest<typeof Schema> {
  protected schema = FluxDevUltraFastSchema;  // Zod schema
  
  getModelUuid(): string { return "wavespeed-ai/flux-dev-ultra-fast"; }
  getModelType(): string { return "text-to-image"; }
  getDefaultParams(): Record<string, any> { return { num_images: 1 }; }
  getFeatureCalculator(): string { return "num_images"; }  // For billing
}
```

### Task Flow
1. **Pre-check**: Verify user has permission & quota
2. **Record**: Deduct usage from user's quota (Unibee)
3. **Create Task**: Store in database with 'pending' status
4. **API Call**: Send to WaveSpeed
5. **Async Update**: Event bus triggers status polling
6. **Store Results**: Save outputs to task_results table

---

## 9. BILLING SYSTEM

### Dual Provider Support
The platform supports two billing backends:

#### Stripe Integration
- Direct checkout sessions
- Webhook handling for subscription events
- Product/price sync

#### Unibee Integration (Primary)
- Usage-based billing with metrics
- Subscription plans with feature limits
- Per-user quota tracking

### Billable Metrics
```typescript
// Define what actions consume quota
{
  code: "image-generation",
  metricName: "Image Generation Count",
  type: 1,  // Count-based
  aggregationType: 1  // Sum
}
```

### Usage Flow
1. User subscribes to plan via Unibee
2. Plan includes metric limits (e.g., 100 images/month)
3. Each AI tool call checks remaining quota
4. On success, metric event recorded
5. On failure, metric event revoked

---

## 10. EVENT BUS SYSTEM

### Purpose
Decouples async operations from main request flow.

```typescript
// lib/events/event-bus.ts
interface IEvent {
  name: string;
  payload: any;
}

// Publishing
eventBus.publish({
  name: "task.update",
  payload: { taskId, status, progress }
});

// Subscribing (done at module load)
eventBus.subscribe("task.update", updateTaskHandler);
```

### Registered Events
| Event | Handler | Purpose |
|-------|---------|---------|
| `task.sync.status` | wsSyncTaskStatusHandler | Poll external API for status |
| `task.record.data` | recordTaskDataHandler | Save task input/output |
| `task.revoke.call.record` | revokeTaskCallRecordHandler | Undo billing on failure |
| `task.update` | updateTaskHandler | Update task status |
| `task.update.remain` | updateRemainHandler | Update user quota |

---

## 11. CACHING SYSTEM

### Configuration
```typescript
// Environment variables
CACHE_MODE=memory|redis
CACHE_MEMORY_TTL=60000
CACHE_MEMORY_LRUSIZE=5000
CACHE_REDIS_URL=redis://...
```

### Usage
```typescript
import { cache } from "@/lib/cache";

await cache.get<T>(key);
await cache.set(key, value, ttl);
await cache.del(key);
```

### Cached Data
- Permission configurations
- Session data
- Frequently accessed queries

---

## 12. INTERNATIONALIZATION (i18n)

### Setup
- **Library**: next-intl 4.1.0
- **Locales**: `en`, `zh-CN`
- **Default**: `en`

### File Structure
```
i18n/
├── en/                    # 136 JSON files
│   ├── home-page.json
│   ├── login-page.json
│   └── ...
├── zh-CN/
├── en.json               # Auto-merged from en/
├── zh-CN.json
├── locales.ts            # Locale definitions
└── request.ts            # Server request handling
```

### Usage
```typescript
// Client component
import { useTranslations } from "next-intl";
const t = useTranslations("HomePage");
return <h1>{t("heroTitle")}</h1>;

// Server component
import { getTranslations } from "next-intl/server";
const t = await getTranslations("HomePage");
```

---

## 13. UI COMPONENT LIBRARY

### Base Components (shadcn/ui style)
Located in `components/ui/`:
- `button.tsx` - Variant-based button
- `card.tsx` - Content container
- `dialog.tsx` - Modal dialogs
- `form.tsx` - Form primitives
- `input.tsx`, `textarea.tsx` - Form inputs
- `select.tsx` - Dropdowns
- `table.tsx` - Data tables
- `tabs.tsx` - Tab navigation
- `dropdown-menu.tsx` - Context menus
- `avatar.tsx` - User avatars
- `badge.tsx` - Status badges

### Design System
```css
/* CSS Variables (globals.css) */
--background, --foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring
--radius
```

### Theme
- **Light/Dark** mode support via `.dark` class
- **Color Palette**: Slate-based neutral with blue/indigo accents
- **Font**: Manrope (Google Fonts)

---

## 14. KEY PAGES & ROUTES

| Route | Purpose |
|-------|---------|
| `/` | Landing page with AI generator demo |
| `/login` | User login |
| `/register` | New user registration |
| `/forgot-password` | Password reset request |
| `/confirm` | Email verification |
| `/auto-login` | Magic link login |
| `/subscribe-plan` | View/purchase subscriptions |
| `/profile` | User profile management |
| `/profile/settings` | Account settings |
| `/profile/plans` | User's subscriptions |
| `/task/history` | Task history list |
| `/task/result` | Generated results gallery |
| `/admin` | Admin dashboard home |
| `/admin/dashboard` | Admin overview |
| `/admin/users` | User management |
| `/admin/roles` | Role management |
| `/admin/permissions` | Permission config |
| `/admin/subscription-plan` | Plan management |
| `/admin/billable-metrics` | Billing metrics |
| `/admin/premium-packages` | Add-on packages |

---

## 15. ENVIRONMENT VARIABLES

### Required
```bash
# Database
POSTGRES_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PRIVATE_SUPABASE_SERVICE_KEY=eyJ...

# Stripe (if using)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Unibee (if using)
UNIBEE_API_BASE_URL=https://api.unibee.top
UNIBEE_API_KEY=...
UNIBEE_PRODUCT_ID=...

# AI Provider
WAVESPEED_API_KEY=...

# App
NEXT_PUBLIC_URL=https://yourapp.com
```

### Optional
```bash
# Cache
CACHE_MODE=memory|redis
CACHE_MEMORY_TTL=60000
CACHE_REDIS_URL=redis://...

# Stripe Account
STRIPE_ACCOUNT_ID=acct_...
```

---

## 16. DATABASE OPERATIONS PATTERN

### CRUD Layer Structure
```
lib/db/crud/
├── auth/
│   └── profiles.query.ts, profiles.edit.ts
├── billing/
│   └── subscription-plans.query.ts, subscription-plans.edit.ts
├── task/
│   └── tasks.query.ts, tasks.edit.ts
└── ...
```

### Pattern
```typescript
// Query operations (read)
// lib/db/crud/module/entity.query.ts
export class EntityQuery {
  static async findById(id: string) { ... }
  static async findAll(filters?: Filters) { ... }
}

// Edit operations (write)
// lib/db/crud/module/entity.edit.ts
export class EntityEdit {
  static async create(data: NewEntity) { ... }
  static async update(id: string, data: Partial<Entity>) { ... }
  static async delete(id: string) { ... }
}
```

---

## 17. TYPE SYSTEM

### DTO Pattern
Database entities are NOT exposed directly to frontend. Instead:

```
lib/db/schemas/  →  lib/mappers/  →  lib/types/  →  Frontend
   (Entity)          (Mapper)         (DTO)
```

### Example Flow
```typescript
// Schema (database)
// lib/db/schemas/auth/profile.ts
export const profiles = pgTable("profiles", { ... });
export type Profile = typeof profiles.$inferSelect;

// DTO (frontend-safe)
// lib/types/auth/profile.dto.ts
export interface ProfileDto {
  id: string;
  email: string;
  username?: string;
  // ... only safe fields
}

// Mapper
// lib/mappers/auth/profile.ts
export class ProfileMapper {
  static toDTO(entity: Profile): ProfileDto { ... }
}
```

---

## 18. BUILD & DEPLOYMENT

### Scripts
```bash
pnpm dev              # Development with Turbopack
pnpm build            # Production build
pnpm start            # Start production server
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed database
pnpm test             # Run Jest tests
pnpm lint             # ESLint
pnpm format           # Prettier
```

### Build-time Processing
1. **Locale Merging**: Combines individual i18n JSON files
2. **Permission Collection**: Merges `*.permission.json` files

### Deployment
- Configured for **Vercel** with `output: "standalone"`
- Can deploy to any Node.js hosting

---

## 19. INTEGRATION POINTS FOR LUCY PAGE

### Potential Merge Strategies

#### 1. **Authentication Unification**
- Both platforms likely need unified user accounts
- Share Supabase instance or federate auth
- Merge profile schemas

#### 2. **Permission System Extension**
- Lucy's features need permission definitions
- Add `*.permission.json` files for Lucy actions
- Define new roles if needed

#### 3. **UI Component Sharing**
- Lucy's UI components could be added to `components/`
- Follow existing shadcn/ui patterns
- Use same CSS variable system

#### 4. **Route Integration**
- Add Lucy routes under `app/[locale]/(studio)/` or new route group
- Follow existing middleware patterns

#### 5. **Database Extension**
- Add Lucy-specific tables to `lib/db/schemas/`
- Follow existing CRUD pattern
- Create mappers and DTOs

#### 6. **AI Model Integration**
- If Lucy has different AI providers, add to `sdk/`
- Follow WaveSpeed SDK patterns
- Integrate with task system

### Questions for Lucy
1. What authentication system does Lucy use?
2. What database schema does Lucy have?
3. What are Lucy's core features/pages?
4. What AI capabilities does Lucy have?
5. What billing model does Lucy use (if any)?
6. What is Lucy's current tech stack?

---

## 20. SUMMARY

**idea2product** is a production-ready AI SaaS template with:

✅ **Complete auth system** (Supabase-based)
✅ **Flexible permission system** (role-based + subscription-based)
✅ **Dual billing support** (Stripe + Unibee)
✅ **83 AI models** via WaveSpeed SDK
✅ **Async task processing** with event bus
✅ **Admin dashboard** for full platform management
✅ **Multi-language support** (i18n)
✅ **Type-safe throughout** (TypeScript + Zod)
✅ **Modern UI components** (Radix + Tailwind)
✅ **Production deployment ready** (Vercel optimized)

The architecture is modular and extensible, making it suitable for merging with Lucy Page's capabilities.

---

*Document generated for cross-platform integration planning*
*Last updated: November 30, 2025*

