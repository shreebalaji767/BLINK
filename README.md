# BLINK

BLINK authentication foundation built with Next.js App Router, TypeScript, Supabase SSR, email/password authentication, and Google OAuth.

## Run

1. Copy .env.example to .env.local.
2. Add your Supabase project URL and publishable key.
3. Run the SQL migration in supabase/migrations/001_blink_profiles.sql.
4. Enable Email and Google providers in Supabase Authentication.
5. Configure Google OAuth using the callback shown by Supabase.
6. Add http://localhost:3000/auth/callback to Supabase redirect URLs.
7. npm install
8. npm run dev

Never expose a Supabase service-role or secret key in browser code.
