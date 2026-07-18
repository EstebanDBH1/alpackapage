# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on http://localhost:3000
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

No test runner or linter is configured.

## Architecture

**Alpacka.ai** is a premium AI prompt marketplace SaaS. React + Vite + TypeScript frontend, Supabase (Postgres + Auth) backend, Paddle for billing. Production domain: `https://www.alpackaai.xyz`.

### File Structure

Source files live flat at the repo root — there is no `src/` directory. Pages are in `pages/`, reusable UI in `components/`, and shared TypeScript interfaces in `types.ts`. `public/` also contains standalone static landing pages (`gpt-tesis/`, `chatgpt-tesis/`) with their own HTML/fonts, independent of the React app.

### Routing (App.tsx)

All routes are defined in `App.tsx`, lazy-loaded per route (code-splitting):
- `/` — Home (marketing landing page)
- `/prompts` / `/prompts/categoria/:category` / `/prompts/:id` — Browse and view prompts
- `/login` — Google OAuth (supports `?redirect=/path`)
- `/dashboard` — Subscription management
- `/guardados` — Saved prompts
- `/pricing` — Single-plan pricing ($4/month via Paddle)
- `/payment-success` — Post-checkout confirmation
- `/ebook` — Standalone sales page for the Notion prompt library ($10 one-time via Hotmart)
- `/skills` — Skills page
- `/blog` / `/blog/:slug` — Blog (content from Supabase `blog_posts`)
- `/admin` / `/admin/blog` — Admin panels (protected by `is_admin` RLS in Supabase)
- `/terms` / `/privacy` — Static legal pages

`STANDALONE_ROUTES` (`/` and `/ebook`) render without the shared Navbar/Footer layout — they bring their own header/footer.

### Key Patterns

**Authentication:** Google OAuth via Supabase Auth. Login page reads `?redirect=` param to return users to their intended destination after sign-in.

**Subscription gating:** Premium prompt content is gated by subscription status. `subscriptions` table tracks `subscription_id`, `status` (`active`, `trialing`, `cancelled`, `past_due`, `paused`), and `paddle_customer_id`. The Dashboard page reads subscription state from Supabase.

**Paddle integration:** Checkout SDK is loaded dynamically. Opens as an overlay with user email pre-filled and Supabase user ID in custom data. Success redirects to `/payment-success`. The `supabase/functions/create-portal-session` Edge Function (Deno) handles sensitive Paddle API calls server-side.

**Data fetching:** Supabase client is initialized in `lib/`. Public reads follow a shared pattern — lightweight payloads + memory/sessionStorage cache with stale-while-revalidate: `lib/promptsList.ts` (prompt catalog via `get_prompts_list()` RPC, no `content` column; shared by `/prompts` and the Home marquee) and `lib/blogList.ts` (blog list without `content` + per-slug post cache). Full prompt content is only fetched per-prompt via `get_prompt_detail()` (subscription-gated). Admin pages intentionally do NOT cache (fresh data while editing). Auth checks use `getSession()` (local read), not `getUser()` (network round-trip). The older `get_public_prompts()` RPC still exists in the DB but the frontend no longer calls it. The `saved_prompts` table joins users to bookmarked prompts.

**Chunk-reload guard:** `index.tsx` listens for Vite's `vite:preloadError` and reloads the page once (sessionStorage flag) when a lazy route chunk fails to load — this recovers visitors whose cached `index.html` references pre-deploy asset hashes.

### Styling

Tailwind CSS compiled via PostCSS (`tailwind.config.js` + `index.css` with `@tailwind` directives). It is NOT loaded via CDN. Two palettes coexist in `tailwind.config.js`:
- `brand.*` colors (light/cream palette) used by older components.
- Semantic tokens (`background`, `foreground`, `card`, `primary`, `accent`, `border`, …) in oklch — the site's dark theme (`oklch(0.15 0.005 60)` background, orange accent `oklch(0.72 0.16 40)`).

**Typography:** The whole app uses **Geist Mono**. All Tailwind font aliases (`font-sans`, `font-mono`, `font-display`, `font-space`) point to Geist Mono in `tailwind.config.js` — Tailwind's preflight applies `sans` to the body, and pages/components use the alias classes. The ONE exception is `/ebook` (`pages/Ebook.tsx`): a light-themed (white, Notion-style) standalone page that sets `"Space Grotesk"` via inline styles on its own root, overriding the global font. Fonts load from Google Fonts in `index.html` (Geist Mono + Space Grotesk only — don't add font families that aren't used).

### Path Alias

`@/` resolves to the repo root (configured in both `vite.config.ts` and `tsconfig.json`).

### Environment Variables

Required `.env` variables (all prefixed `VITE_` for frontend access):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `VITE_PADDLE_CLIENT_TOKEN` / `VITE_PADDLE_PRICE_ID`

Supabase service role key and Paddle API key are used only in Edge Functions (not exposed to the browser).

### Deployment

`www.alpackaai.xyz` is served through Cloudflare (Pages). Cache policy lives in `public/_headers`: HTML is `no-cache, must-revalidate`; `/assets/*` (hashed filenames) is `immutable, max-age=1y`. Known platform gotcha: a request for a **missing** `/assets/*` file returns the SPA-fallback `index.html` with 200 + the immutable header, so browsers can cache HTML under an asset URL during a deploy window — the `vite:preloadError` reload guard in `index.tsx` mitigates this.

`vercel.json` (SPA rewrites + the same cache headers) and `middleware.ts` (Vercel Edge Middleware serving OG meta tags to social crawlers) remain from the Vercel setup; `middleware.ts` does not run on Cloudflare Pages.

The Supabase Edge Function (`supabase/functions/create-portal-session/`) is deployed separately via Supabase CLI.
