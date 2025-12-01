# AI-Friendly Tool Project Template

This is a project template specifically designed for AI applications, aiming to provide a clear, easy-to-extend development foundation.

## Getting Started for Developers

For more detailed information, please refer to [README.DETAILED.md](./README.DETAILED.md)

To start developing with this project, follow these steps:

1.  **Install Dependencies**:
    ```bash
    pnpm i
    ```

2. **Environment Variable Configuration**:
    ```bash
    cp .env.local.example .env
    ```
    Then edit the .env file and fill in the necessary environment variables.
    Required environment variables and their purposes are as follows:
    * POSTGRES_URL: Required - Database connection string, can be copied from supabase Connect>ORM, remember to replace the database password
    * STRIPE_SECRET_KEY: Required - Stripe secret key
    * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Required - Stripe publishable key
    * STRIPE_WEBHOOK_SECRET: Required - Stripe webhook secret
    * NEXT_PUBLIC_URL: Required - Outbound information configuration for redirects (e.g., after successful payment)
    * NEXT_PUBLIC_SUPABASE_URL: Required - Supabase URL. Although we use ORM for database operations, Supabase auth module is still needed
    * NEXT_PUBLIC_SUPABASE_ANON_KEY: Required - Supabase anonymous key
    * NEXT_PRIVATE_SUPABASE_SERVICE_KEY: Required - Supabase service key
    * OPENMETER_BASE_URL: Required - OpenMeter URL for usage billing module
    * OPENMETER_API_TOKEN: Required - OpenMeter API token for usage billing module
    * GEMINI_API_KEY: Required for Lucy - Google Gemini API key for AI generation

3.  **Run Database Migrations**:
    ```bash
    pnpm run db:migrate
    ```

4. **Run Development Server**:
    ```bash
    pnpm run dev
    ```

## Acknowledgements

This project references and thanks the following excellent open-source projects:

*   [Next.js](https://nextjs.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Drizzle ORM](https://orm.drizzle.team/)