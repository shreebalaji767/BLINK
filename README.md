# BLINK

BLINK is a lightweight social communication web application for chat, snaps, stories, friends, profiles, and temporary sharing.

## Current stack

- Next.js 16.3.8 (Active LTS)
- React 19
- TypeScript
- Supabase Auth + database access
- Responsive mobile/desktop UI
- PWA manifest and installable app metadata
- Security headers and production-oriented configuration

## Features

- Email/password authentication
- Username-based people search
- Friend requests and relationships
- Private conversations
- Temporary/disappearing messages
- Snaps and temporary media
- Stories
- Profile and account settings
- Privacy options such as Ghost Mode
- Dark/light appearance support
- Responsive mobile navigation
- PWA install metadata
- SEO metadata, robots and sitemap support

## Development

### Requirements

Use a current Node.js LTS release.

### Setup

```bash
npm install
```

Create `.env.local` from `.env.example` and provide:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

### Run

```bash
npm run dev
```

### Validate

Run the full local validation before deployment:

```bash
npm run check
```

This runs linting, TypeScript validation, and a production build.

## Deployment

BLINK is a server-rendered Next.js application because authentication/session handling uses Supabase server utilities. It should be deployed to a Next.js-capable runtime such as Render or Vercel.

**GitHub Pages is not used for the application runtime.** The previous Pages workflow expected a static `out` directory even though the app is not configured as a static export; the workflow has been replaced with CI validation.

## Environment and security

Never commit passwords, service-role keys, private API tokens, or other secrets.

The public Supabase publishable key may be present in client-side configuration, but database access must still be protected by correct Supabase Row Level Security policies.

BLINK also sends baseline security headers from `next.config.ts`.

## PWA / app metadata

BLINK includes:

- Web app manifest
- BLINK app icon
- Theme color
- Mobile viewport configuration
- Open Graph metadata
- Twitter metadata
- Robots metadata
- Sitemap metadata

## Project structure

- `app/` — Next.js routes, metadata, and global styling
- `components/blink/` — BLINK UI components
- `lib/` — authentication and Supabase helpers
- `supabase/` — migrations and edge functions
- `.github/workflows/` — CI automation

## Privacy note

Temporary or disappearing content cannot guarantee that another person will not copy, screenshot, screen-record, photograph, or otherwise preserve it before expiry.

Review authentication, permissions, storage, retention, and Row Level Security policies before using a deployment with real users.
