# BLINK

BLINK authentication foundation built with Next.js App Router, TypeScript, Supabase SSR, email/password authentication, and Google OAuth.

## Supabase

The BLINK Supabase project is configured in the India region.

- Project URL: https://duwekongedkccrrsnvtl.supabase.co
- Database: PostgreSQL 17
- Authentication: Supabase Auth
- Profiles: RLS-protected `public.profiles` table
- Publishable key: safe to use in the browser

## Run

1. Copy `.env.example` to `.env.local`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000/login`.

The Supabase `profiles` schema and signup trigger are already created in the connected BLINK project.

For local OAuth, configure `http://localhost:3000/auth/callback` as an allowed redirect URL in Supabase.

Google OAuth additionally requires Google Cloud OAuth credentials; these cannot be generated without access to the Google account/project that owns the OAuth client.

Never expose a Supabase service-role or secret key in browser code.
