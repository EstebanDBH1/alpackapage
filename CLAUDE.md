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
- `/generador` — AI prompt generator (subscribers only; calls the `generate-prompt` Edge Function)
- `/pricing` — $7/month subscription via Paddle, plus a one-time $47.99 lifetime library plan
- `/checkout` — Embedded Paddle checkout; `?plan=lifetime` opens the one-time plan, no param opens the monthly one
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

`lib/access.ts` is the single place the frontend decides what a `subscription_status` unlocks (`hasLibraryAccess` / `hasGeneratorAccess`). It is UI only — the real boundary is server-side: `has_library_access()` for the library, `generate-prompt` for the generator. Change a list in one place and you must change it in the other, or the UI will lie.

**Lifetime plan.** `lifetime` is the one-time $47.99 purchase: everything the monthly plan includes — the full library *and* the AI generator — forever, with future updates. It is in both `LIBRARY_STATUSES` and `GENERATOR_STATUSES`. The generator's per-use cost (Gemini calls) is bounded by the same 10-generations-per-day limit that applies to subscribers, which is what makes it viable against a single payment. Server-side, `has_library_access()` (SECURITY DEFINER, migration `add_lifetime_library_access`) is the one place the library's status list lives; both the `prompts` RLS policy and `get_prompt_detail()` call it, so there is no longer a list to keep in sync between them. The generator's list is separate and still hardcoded in `generate-prompt/index.ts` — change it there and in `lib/access.ts` together.

Lifetime rows are written by `paddle-webhook` on `transaction.completed`. Two things make that safe and are easy to break: the handler ignores any transaction carrying a `subscription_id` (every monthly renewal fires `transaction.completed` too, and without that check a $7 subscriber would be upgraded to lifetime for free), and the `subscription.*` branch refuses to overwrite a `lifetime` status (otherwise the `canceled` event from a lifetime buyer's old monthly sub would revoke access they already paid for). A lifetime row has no `current_period_end` and no Paddle subscription behind it, so the Dashboard must not offer it a cancel button or the billing portal — `subscription_id` holds the Paddle **transaction** id.

> **`subscriptions` is read-only from the browser — never add a write path.** `subscription_status` is the column the `prompts` RLS policy and `get_prompt_detail()` trust to decide who sees premium content, so a client-writable `subscriptions` row *is* a free premium account. It used to have INSERT/UPDATE policies checking only `auth.uid()::text = customer_id` (who owns the row, never what it says), which let any signed-in user grant themselves an `active` subscription; those policies were dropped and INSERT/UPDATE/DELETE/TRUNCATE revoked from `anon` and `authenticated` (migration `lock_down_subscriptions_writes`). Only the service role writes there — the Paddle/PayPal webhooks and `create-portal-session`, which bypass RLS. If a feature seems to need a client-side write, it belongs in an Edge Function instead.

**Paddle integration:** Checkout SDK is loaded dynamically. Opens as an overlay with user email pre-filled and Supabase user ID in custom data. Success redirects to `/payment-success`. The `supabase/functions/create-portal-session` Edge Function (Deno) handles sensitive Paddle API calls server-side.

**Prompt generator:** `supabase/functions/generate-prompt` (Deno) powers `/generador`. It verifies the JWT, requires an `active`/`trialing` subscription, enforces a 10-generations-per-day limit per user (UTC day; atomic upsert via the `increment_generator_usage` RPC on the `generator_usage` table, refunded on failure via `decrement_generator_usage`), and calls the Gemini API (`GEMINI_API_KEY` secret; model `gemini-3.6-flash`, override with `GEMINI_MODEL`; limit override with `GENERATOR_DAILY_LIMIT`). Users can SELECT their own `generator_usage` row (RLS) so the UI shows the remaining count; only the service role can write. CORS is restricted to the production domains + `localhost:3000`.

**Data fetching:** Supabase client is initialized in `lib/`. Public reads follow a shared pattern — lightweight payloads + memory/sessionStorage cache with stale-while-revalidate: `lib/promptsList.ts` (prompt catalog via `get_prompts_list()` RPC, no `content` column; shared by `/prompts` and the Home marquee) and `lib/blogList.ts` (blog list without `content` + per-slug post cache). Full prompt content is only fetched per-prompt via `get_prompt_detail()` (subscription-gated). Admin pages intentionally do NOT cache (fresh data while editing). Auth checks use `getSession()` (local read), not `getUser()` (network round-trip). The older `get_public_prompts()` RPC still exists in the DB but the frontend no longer calls it. The `saved_prompts` table joins users to bookmarked prompts.

**Chunk-reload guard:** `index.tsx` listens for Vite's `vite:preloadError` and reloads the page once (sessionStorage flag) when a lazy route chunk fails to load — this recovers visitors whose cached `index.html` references pre-deploy asset hashes.

### Styling

Tailwind CSS compiled via PostCSS (`tailwind.config.js` + `index.css` with `@tailwind` directives). It is NOT loaded via CDN. Two palettes coexist in `tailwind.config.js`:
- `brand.*` colors (light/cream palette) used by older components.
- Semantic tokens (`background`, `foreground`, `card`, `primary`, `accent`, `border`, …) in oklch — the site's dark theme (`oklch(0.15 0.005 60)` background, orange accent `oklch(0.72 0.16 40)`).

**Typography:** The site pairs **Hanken Grotesk** (everything that is read: headings, body copy, buttons, nav) with **JetBrains Mono** (technical accents only: uppercase/tracked eyebrows, badges and chips, dates, prices and counters, prompt/code `<pre>` blocks, the `alpacka.ai` wordmark). Keeping the mono to those roles is what makes the pairing read as intentional — don't set body copy in mono.

Two ways to reach them:
- **Tailwind aliases** in `tailwind.config.js`: `font-sans` / `font-display` / `font-space` → Hanken Grotesk (`display` and `space` are historical aliases, all three are the same sans); `font-mono` → JetBrains Mono. Tailwind's preflight puts the sans on the body.
- **Inline styles** in the dark theme: `components/darkKit.tsx` exports `SANS` and `MONO` (and `FONT = SANS` for the pages migrated from the light kit). `components/landingKit.tsx` exports the same names for the light landings — it no longer loads Euclid Circular, so `useEuclidFont()` is a kept-for-compat no-op.

Both kits' `LandingStyles` force `SANS` on everything inside `.bp-scope` and re-exempt `.font-mono`, `code`, `pre` and `kbd`, so the Tailwind utility still wins inside those pages. Fonts load from Google Fonts in `index.html` (Hanken Grotesk + JetBrains Mono only — don't add font families that aren't used). The standalone static landings under `public/` (`gpt-tesis/`, `chatgpt-tesis/`, `new-page-alpacka/`) are independent HTML with their own font links and don't follow this.

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
