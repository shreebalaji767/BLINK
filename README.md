# BLINK — NPC Social

**A text-only social network for fictional characters across the multiverse.**  
Expect dramatic status updates, impossible arguments, suspiciously specific complaints, rumours, parody ads, and absolutely no moderation.

**Live site:** https://shreebalaji767.github.io/BLINK/

## What it is

BLINK is a fictional-character social-network simulation. NPCs publish locally generated posts, react to one another, and argue in comment threads. The experience runs entirely in the visitor's browser.

It is a static GitHub Pages project built with HTML, CSS, and ordinary JavaScript. It does not require a backend, database, account system, paid service, subscription, or external API.

## Features

- **Multiverse feed:** fictional settings spanning anime, manga/manhwa/manhua, donghua, C-/K-/J-drama, light novels, web novels, comics (including Marvel, DC, and Image Comics), fantasy, science fiction, games, and cartoons.
- **Large NPC directory:** 136 hand-authored character entries plus 2,176 generated original supporting residents (2,312 directory entries in total). Search the directory and filter by world/setting. Generated residents are original background NPCs, not a claim to include every canon character in every franchise.
- **Procedural posts:** JavaScript assembles varied, character- and setting-aware updates, rumours, gossip, complaints, and absurd everyday incidents.
- **Connected NPC conversations:** NPCs can follow up on, support, dispute, or add context to another resident's earlier post. These references are stored with the post so conversations remain connected after reload.
- **Post-specific comment threads:** NPC replies are generated in relation to the post, with chaotic conversations, arguments, jokes, occasional thirst-comment parody, and parody advertisements.
- **Contextual reactions:** posts display varied emoji reactions and simulated counts.
- **NPC profiles:** open a profile from the directory or by selecting a post author's username. NPC profiles show randomized timelines of 5–15 generated posts.
- **Observer profile:** view your own profile and the posts you have written.
- **Persistent local feed:** generated NPC posts, connected-post references, replies, Observer posts, likes, and reactions are saved in this browser. The feed keeps its newest 180 posts to limit local storage usage.
- **Local social state:** follows and saved posts are stored in this browser using `localStorage`.
- **Feed controls:** search, world filters, following, trending, saved posts, sorting, shuffling, and load-more behavior.
- **Observer posts:** write a short text post (up to 280 characters) into the local feed.
- **Responsive interface:** desktop sidebar layout adapts to smaller screens and touch devices.

## Run it locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

No dependency installation or build step is required for the static site.

## Publish with GitHub Pages

The workflow at `.github/workflows/pages.yml` publishes the repository root when changes are pushed to `main`.

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Push changes to `main`, or manually run the deployment workflow from the Actions tab.
4. Open the Pages URL shown in the repository's Pages settings.

The repository also includes a CI workflow at `.github/workflows/ci.yml`.

## Data and privacy

- Feed content and NPC activity are generated or simulated in the browser.
- Posts, comments, likes, reactions, follows, saved posts, and NPC history remain in the same browser profile.
- The feed stores up to its newest 180 posts locally. Browser storage limits or private-browsing restrictions may prevent saving.
- Clearing this site's browser storage can remove locally saved social data.
- There is no BLINK backend and no cross-device synchronization.

## Project structure

- `index.html` — page structure, navigation, and application entry point
- `styles.css` — responsive interface styling
- `app-social-requests.js` — active browser application: NPC data, feed persistence, connected conversations, profiles, post and comment generation, and reactions
- `app.js` — retained earlier/legacy application script; it is not the script loaded by the current `index.html`
- `public/favicon.svg` — site icon
- `.github/workflows/pages.yml` — GitHub Pages deployment
- `.github/workflows/ci.yml` — static-site validation

## Scope and limitations

BLINK is a fictional-character social-network parody, not a real messaging platform. It has no real user accounts, server-side persistence, live multiplayer/social graph, or cross-device sync. The NPCs and their interactions are simulated with ordinary client-side JavaScript; no AI service is used.

### NPC history

NPCs already shown in the feed are recorded in `localStorage` and are not selected again until the current directory roster has been exhausted; a fresh cycle then begins. Feed history is stored separately, so refreshing the page restores the existing posts rather than generating a replacement timeline.
