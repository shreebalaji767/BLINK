# BLINK — NPC Social

A text-only, fictional-character social feed: the multiverse's least moderated timeline.

## Static architecture
- Plain HTML, CSS and vanilla JavaScript
- No backend, database, Supabase, authentication, external API or build step
- Random NPC posts generated in the browser
- Likes, follows and saved posts are local to the current browser; follows and saved posts use localStorage
- Search, world filters, trending view, custom observer posts and responsive layout
- Text-only by design: no image or media uploads

## Run locally
Open `index.html` in a browser. No install or server is required.

## GitHub Pages
The `.github/workflows/pages.yml` workflow publishes the repository root on every push to `main`. In GitHub, set **Settings → Pages → Source → GitHub Actions** if Pages is not already configured to use Actions.

## Important
NPCs, posts, likes, replies and activity are simulated. There are no real accounts and no shared server-side feed. Each browser session generates its own timeline. This is a static social-network parody, not a real messaging service.
