# AI-Friendly Tool Project Template

This is a project template specifically designed for AI applications, aimed at providing a clear and extensible development foundation.

## How to Start Development

To begin development with this project, follow these steps:

1.  **Install Dependencies**:
    ```bash
    pnpm i
    ```

2. **Environment Variable Configuration**:
    ```bash
    cp .env.local.example .env.local
    ```
    Then edit the .env.local file and fill in the necessary environment variables.
    Required environment variables and their purposes are as follows:
    * POSTGRES_URL: Required - Database connection string, can be copied from supabase Connect>ORM, remember to replace the database password
    * STRIPE_ACCOUNT_ID: Optional - Stripe account ID. Note that this can be any string without validation, used to distinguish automatic creation of Stripe product information
    * STRIPE_SECRET_KEY: Required - Stripe secret key
    * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Required - Stripe publishable key
    * STRIPE_WEBHOOK_SECRET: Required - Stripe webhook secret
    * NEXT_PUBLIC_URL: Required - Outbound information configuration for redirects (e.g., after successful payment)
    * AUTH_SECRET: Optional - Auth secret, not currently used
    * NEXT_PUBLIC_SUPABASE_URL: Required - Supabase URL. Although we use ORM for database operations, Supabase auth module is still needed
    * NEXT_PUBLIC_SUPABASE_ANON_KEY: Required - Supabase anonymous key
    * NEXT_PRIVATE_SUPABASE_SERVICE_KEY: Required - Supabase service key
    * OPENMETER_BASE_URL: Required - OpenMeter URL for usage billing module
    * OPENMETER_API_TOKEN: Required - OpenMeter API token for usage billing module
    * CACHE_MODE: Optional - Cache mode, options: memory, redis
    * CACHE_MEMORY_TTL: Optional - Expiration time when cache mode is memory
    * CACHE_MEMORY_LRUSIZE: Optional - LRU size when cache mode is memory
    * CACHE_REDIS_URL: Optional - Redis URL when cache mode is redis
    * GEMINI_API_KEY: Required for Lucy feature - Google Gemini API key for AI generation
    * LUCY_SUNO_REFERRAL_URL: Optional - Suno referral URL (defaults to https://suno.com/invite/@bilingualbeats)

3.  **Generate Database Client**:
    ```bash
    pnpm run db:generate
    ```

4.  **Run Database Migrations**:
    ```bash
    pnpm run db:migrate
    ```

5. **Run Development Server**:
    ```bash
    pnpm run dev
    ```
## Directory Structure

The directory structure of this project is designed to provide clear separation of responsibilities and modularity:

*   **`app/`**: The root directory of the Next.js application, containing all routes, pages, layouts, and API routes.
    *   `app/actions/`: Contains Server Actions, a Next.js concept for executing operations on the server side. Facilitates easier interaction.
    *   `app/globals.css`: Global CSS styles.
    *   `app/layout.tsx`: Root layout file, defining the overall structure of the application.
    *   `app/not-found.tsx`: 404 page.
    *   `app/[locale]/(auth)`: Authentication-related pages, such as login, registration, forgot password, etc.
    *   `app/[locale]/(billing)`: Subscription-related pages, such as subscription, subscription cancellation, subscription success, etc.
    *   `app/[locale]/(dashboard)`: Dashboard-related pages, such as dashboard, user management, role management, etc.
    *   `app/[locale]/admin`: Admin backend-related pages, such as admin dashboard, admin user management, admin role management, etc.
    *   `app/api/`: API routes, for example `app/api/stripe/webhook/route.ts` for handling Stripe Webhooks.
*   **`components/`**: Contains reusable UI components.
*   **`config/permission.merge.json`**: Note that permission configuration is automatically generated. You can add a {name}.permission.ts file wherever you want to add permissions, then configure it internally using a format similar to app/actions/billing/billing.permission.json.
*   **`i18n/`**: Internationalization (i18n) related resource files.
    *   `i18n/locales.ts`: Defines supported languages.
    *   `i18n/request.ts`: May be used for handling internationalization requests.
    *   `i18n/en/` and `i18n/zh-CN/`: Contains translation JSON files for different languages.
    *   `i18n/en.json` and `i18n/zh-CN.json`: Aggregate language files from corresponding directories, automatically generated.
*   **`lib/`**: Contains common utility functions, services, database connections, and other library files.
    *   `lib/auth/`: Contains authentication-related logic, including user authentication, session management, etc.
    *   `lib/cache/`: Contains cache-related logic, including memory cache and Redis cache, etc. Provides unified cache for server-side use.
    *   `lib/db/`: Database-related configuration and operations, such as `drizzle.ts`. Besides drizzle-related content, it also includes the core structure of this template.
    *   `lib/db/crud/`: Database CRUD operations, provided for actions to use. Implemented with small granularity according to convention, split into {name}.query.ts, {name}.edit.ts for different functions, with the core aim of avoiding too much content in a single file.
    *   `lib/db/migrations/`: Database migration files, provided for drizzle to use. Generated by db:generate and records each change to facilitate upgrade support.
    *   `lib/db/schemas/`: Database table structure definitions, provided for drizzle and crud to use.
    *   `lib/events/`: Event bus. Defined for event information decoupling, but not currently used. According to the design, if there are relatively few functional modules, its significance is not very great.
    *   `lib/types/`: Data type definitions. Provided for actions and pages to use, avoiding direct exposure of database objects.
    *   `lib/mappers/`: Data mappers. Maps objects between lib/db/schemas and lib/types to prevent database objects from being directly exposed to the frontend.
    *   `lib/openmeter/`: OpenMeter usage billing module.
    *   `lib/permission/`: Permission management related logic, including configuration, guards, and services.
*   **`scripts/`**: Contains auxiliary scripts, such as build scripts, deployment scripts, etc.
*   **`utils/`**: Contains common utility functions, usually pure functions that do not depend on specific frameworks or business logic.

## Currently Implemented Pages

The following are the pages implemented in this project and their corresponding routes:

*   `/`: Home page
*   `/confirm`: Email confirmation page
*   `/forgot-password`: Forgot password page
*   `/login`: Login page
*   `/register`: Registration page
*   `/subscribe-plan`: Subscription page
*   `/subscribe-plan/cancel`: Subscription cancellation page
*   `/subscribe-plan/success`: Subscription success page
*   `/profile`: User profile page
*   `/profile/settings`: User settings page
*   `/admin`: Admin dashboard home
*   `/admin/dashboard`: Admin dashboard page
*   `/admin/permissions`: Admin permission management page
*   `/admin/roles`: Admin role management page
*   `/admin/subscription-plan`: Admin subscription plan management page
*   `/admin/users`: Admin user management page
*   `/history`: History page
*   `/test`: Test page


## Permission Module Design
1. Configure permissions through distributed {name}.permission.ts files closest to the business logic, with internal configurations for pages, APIs, actions, and UI components (not yet implemented)
2. Collect and consolidate during webpack phase and save to the config directory
3. The system determines at runtime whether to load this dynamic permission configuration and synchronize it to the database (permissions are based on the database)
4. Initialize configuration at runtime and handle permissions during middleware, action calls, and other timing points


## Multilingual Implementation
1. Based on next-intl
2. In the corresponding i18n directory, use AI to generate fine-grained JSON files. Note the mapping relationship: filenames use message+kebab-case style, while intl references follow PascalCase naming convention
3. Complete during the webpack phase
## Basic Implementation Path for Business Logic
1. Define database table structures in /lib/db/schemas/{module}/{table}.ts
2. Define database CRUD operations in /lib/db/crud/{module}/{table}.edit.ts and {module}/{table}.query.ts, with the convention of splitting into two types of behaviors for finer granularity
3. Define data types in /lib/types/{module}/{table}.ts for use by actions and pages, avoiding direct exposure of database objects
4. Define Server Actions in /app/actions/{module}/{action}.ts to provide frontend access
5. Generate and use frontend pages under /app/[locale]/{module}/{page}

## Account and Usage Billing Explanation
1. There are two subscription+payment models: subscription-plan Subscription information is separated from payment platforms, with platform product prices dynamically created (and recorded) only during subscription
2. Generate corresponding plans information in OpenMeter as the standard basis for usage billing
3. First create Meters in OpenMeter to measure usage through system-specific event keys (by count, by token). Then create features by packaging a billing method into a functionality
4. Add features to plans in OpenMeter to bind specific functionalities to subscriptions
5. The system receives synchronized data from OpenMeter to obtain usage billing information for frontend access processing. OpenMeter APIs can also be called directly, but with limited call frequency
6. When users initiate subscriptions, a subscription operation is sent to OpenMeter binding the user+plan together as a billing entity
7. Usage process restrictions, etc.
8. Subscription user counts and consumption details can be viewed in OpenMeter

## Acknowledgements

This project references and thanks the following excellent open-source projects:

*   [Next.js](https://nextjs.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Drizzle ORM](https://orm.drizzle.team/)