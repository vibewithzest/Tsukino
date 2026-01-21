## PROMPT: "Ultra-Fast Anime Streaming Platform"

### Project Goal
Build a fast anime discovery and player platform (no video hosting) focused on exploration, not complexity.

### Performance Targets
- Lighthouse Score: 96-99
- LCP: <1.5s (slightly higher due to video thumbnails)
- FID: <50ms
- CLS: 0
- Bundle Size: 40-55KB

### Tech Stack (2026 OPTIMIZED)
Framework: Astro 5.16 (static pages) + SvelteKit (player pages)
├─ Why: Hybrid approach
├─ Astro for: Homepage, anime catalog, search results (static + ISR)
├─ SvelteKit for: Player page, playlist state, progress tracking
├─ Share same component library between both

Styling: Tailwind CSS v4 + UnoCSS
├─ Why: Same as manga reader, proven at scale

Animations: CSS @keyframes + Svelte transitions
├─ No GSAP, no heavy libraries
├─ Smooth page transitions via Svelte:key

Backend: Bun + Elysia (SAME as manga platform)
├─ Handles: metadata API, progress tracking, watchlist

Database: Supabase PostgreSQL
├─ Minimal schema:
  ├─ anime (id, title, cover, synopsis, episodes_count, status)
  ├─ episodes (id, anime_id, ep_num, title, duration, external_url)
  ├─ user_progress (user_id, anime_id, watched_episodes, rating)
  └─ watchlist (user_id, anime_id, added_date)

Video: External (don't host yourself)
├─ Why: Video bandwidth is EXPENSIVE
├─ Link to AniList/MAL APIs or scrape from external sources
├─ Store only metadata + episode URLs, not video files

Image CDN: Cloudflare Images or Bunny
├─ Same auto-optimization as manga reader
├─ Thumbnail sizes: small (80x120), medium (200x300), large (400x600)

### Design System (2026 Standard)
Style: Liquid Glass + Alive & Responsive Interfaces
├─ Translucent cards for anime titles
├─ Responsive to user interactions (scale, blur)
├─ Microinteractions on play button, rating system, watchlist add

Typography: System fonts + Inter
├─ Anime titles in bold (stand out visually)
├─ Episode descriptions in lighter weight

Colors: Dark mode primary (anime watchers are night owls)
├─ Accent: Teal/blue (anime color convention)
├─ Hover states: slight opacity + scale

### Core Pages (ONLY These)
1. **Homepage**
   - Hero section: Currently airing anime (2-3 featured)
   - Trending anime grid (12-16 items)
   - New releases grid
   - Genre quick filter buttons (Action/Romance/School/Supernatural)
   - Search bar + advanced filter link
   - NO algorithm recommendations, NO personalization yet

2. **Anime Detail Page**
   - Large cover image + title/rating/status
   - Synopsis (2-3 sentences)
   - Episodes list (sortable by airing date, reverse order default)
   - External player link (with warning: "Opens external player")
   - Rating widget (star system, 1-10)
   - Watchlist button (add/remove)
   - NO comments, NO reviews

3. **Episode Player**
   - Fullscreen video embed from external source
   - Play/pause/timeline controls
   - Episode picker (dropdown or chapter nav)
   - Previous/Next episode buttons
   - Watch time tracking (localStorage or Supabase)
   - Subtitle toggle (if external player supports)
   - NO custom video player (too complex for solo)

4. **Search Results**
   - Real-time search by anime title
   - Filters: Status (Airing/Completed), Type (TV/Movie/OVA), Year
   - Pagination (24 per page, not infinite scroll)

5. **Watchlist**
   - Logged-in users only (use Supabase Auth)
   - Show: anime poster, episodes watched/total, last watched
   - Sort: Recently watched, Rating, Date added
   - NO sharing, NO social features

### Features (Solo-Friendly)
✅ Anime directory with search
✅ Watch progress tracking
✅ Watchlist (add/remove)
✅ Star rating (1-10 system)
✅ External episode links
✅ Responsive design (mobile-first)
✅ Dark/light toggle
✅ Recently watched history (localStorage)

❌ Video hosting (use external APIs)
❌ User accounts initially (add later with Auth)
❌ Community/comments (too complex)
❌ Recommendations algorithm (requires ML)
❌ Advanced analytics (focus on UX first)
❌ Subtitles generation (use external player)

### Architecture (Key Principles)
Database: Ultra-minimal schema
├─ anime (id, title_en, title_jp, cover_url, synopsis, status, year, type)
├─ episodes (id, anime_id, ep_num, title, duration, external_source_url)
└─ watchlist (user_id, anime_id, watched_episodes) [optional if Auth added]

API Endpoints (Total: 5)
├─ GET /api/anime (trending/new, paginated)
├─ GET /api/anime/:id (detail with episodes)
├─ GET /api/episodes/:id (external stream URL)
├─ POST /api/watchlist (add/remove anime)
└─ GET /api/search (full-text search)

External Data Sources
├─ AniList GraphQL API (free): Get anime metadata
├─ MyAnimeList API: Alternative source
├─ Scrape episode URLs from external streaming sites (respect terms)
├─ Store only metadata + links, NOT copyrighted content

### UI Patterns (2026 Standard)
Alive & Responsive Interfaces
├─ Anime cards: Scale 1.05 on hover + shadow increase
├─ Play button: Pulsing animation (subtle)
├─ Rating stars: Glow on click (color feedback)
├─ Watchlist button: Change color + checkmark animation

Liquid Glass
├─ Player overlay: Semi-transparent dark bg with blur
├─ Genre tags: Translucent pills with subtle border
├─ Episode picker: Floating glass panel (not dropdown)

Microinteractions
├─ Hover anime card: Blur background slightly
├─ Add to watchlist: Brief success toast (2s)
├─ Episode change: Fade transition (200ms)
├─ Star rating: Color fade (yellow stars on hover)

Navigation
├─ Top bar: Logo + search + dark toggle (sticky)
├─ Mobile: Bottom tab bar (Home, Search, Watchlist)
├─ Player: Minimal bottom controls (auto-hide after 3s)

### Performance Checklist
- [ ] Cover images: AVIF/WebP, lazy-loaded, max 300KB
- [ ] Thumbnails: 50-80KB each
- [ ] Zero 3rd-party scripts initially (no trackers)
- [ ] CSS: Purged unused Tailwind classes
- [ ] JS: Minimal, tree-shaken dependencies
- [ ] Videos: Embedded from external player only
- [ ] Mobile: Touch-friendly (44px+ tap targets)
- [ ] Accessibility: Keyboard nav, semantic HTML, WCAG AA

### Deployment
Frontend: Vercel (Astro + SvelteKit optimized)
Backend: Railway or Fly.io (Bun)
Database: Supabase (auto-backup)
Images: Cloudflare Images (automatic optimization)

### Why This Stack for Solo Dev
✅ Astro: Static generation = instant loads
✅ SvelteKit: Only interactive where needed (player)
✅ No video hosting: Avoid bandwidth nightmare
✅ External APIs: Don't rebuild what exists (AniList, MAL)
✅ Supabase: One-click PostgreSQL, no DevOps
✅ Vercel: Auto-deploy, no server management

### Solo Dev Timeline
- Homepage + Trending: 2 days
- Anime Detail page: 1 day
- Search + filters: 1 day
- Player integration (embed external): 2 days
- Watchlist + progress tracking: 2 days
- Mobile optimization: 1 day
- Deploy: 1 day
= **Total: 10 days** for MVP (discovery + playback platform)

### What NOT to do
❌ Host your own video server (bandwidth $$$)
❌ Build custom video player (use embeds)
❌ Implement full authentication initially (add Supabase Auth later)
❌ Create recommendation engine (too complex)
❌ Add payment system (monetize later)
❌ Build content management system (use Supabase UI)
❌ Add social features (focus on discovery first)

### Optional Phase 2 (After Launch)
Once MVP is live, add:
- User authentication (Supabase Auth)
- Detailed watchlist with sorting
- Ratings and reviews
- Follow other users
- Personalized homepage (based on watch history)
- Email notifications for new episodes
- Mobile app (Flutter cross-platform)

But NONE of this in MVP. Keep it simple, ship fast.

### Key Differences from Real Platforms
This is NOT Crunchyroll or Netflix:
- ❌ No video hosting (bandwidth cost = ∞)
- ❌ No DRM/licensing (link to existing sources)
- ❌ No payment processing (free tier)
- ❌ No enterprise features (scaling comes later)

This IS:
- ✅ A personal discovery tool
- ✅ An aggregator (like MyAnimeList UI improvement)
- ✅ A learning project (understand streaming workflows)
- ✅ Solo-developer friendly (no DevOps nightmare)

### Monetization Strategy (Later)
- Ad network (AdSense) on static pages
- Affiliate links to Crunchyroll/Netflix
- Patreon for community features
- GitHub sponsors for development

NOT directly selling content.
