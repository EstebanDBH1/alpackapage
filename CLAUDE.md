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

**Alpacka.ai** is a premium AI prompt marketplace SaaS. React + Vite + TypeScript frontend, Supabase (Postgres + Auth) backend, Paddle for billing.

### File Structure

Source files live flat at the repo root — there is no `src/` directory. Pages are in `pages/`, reusable UI in `components/`, and shared TypeScript interfaces in `types.ts`.

### Routing (App.tsx)

All routes are defined in `App.tsx`:
- `/` — Home (marketing landing page)
- `/prompts` / `/prompts/:id` — Browse and view prompts
- `/login` — Google OAuth (supports `?redirect=/path`)
- `/dashboard` — Subscription management + saved prompts
- `/pricing` — Single-plan pricing ($4/month via Paddle)
- `/payment-success` — Post-checkout confirmation
- `/terms` / `/privacy` — Static legal pages

### Key Patterns

**Authentication:** Google OAuth via Supabase Auth. Login page reads `?redirect=` param to return users to their intended destination after sign-in.

**Subscription gating:** Premium prompt content is gated by subscription status. `subscriptions` table tracks `subscription_id`, `status` (`active`, `trialing`, `cancelled`, `past_due`, `paused`), and `paddle_customer_id`. The Dashboard page reads subscription state from Supabase.

**Paddle integration:** Checkout SDK is loaded dynamically. Opens as an overlay with user email pre-filled and Supabase user ID in custom data. Success redirects to `/payment-success`. The `supabase/functions/create-portal-session` Edge Function (Deno) handles sensitive Paddle API calls server-side.

**Data fetching:** Supabase client is initialized in `lib/`. Prompts are fetched via `get_public_prompts()` RPC; individual prompt content is fetched via `get_prompt_detail(prompt_id)` RPC. The `saved_prompts` table joins users to bookmarked prompts.

**Subscription table schema:** The `subscriptions` table uses `subscription_status` (not `status`) and `customer_id` which equals the Supabase `user.id` — not a Paddle customer ID. Active states are `active` and `trialing`.

**UI language:** All user-facing copy (alerts, labels, buttons) is in Spanish.

### Styling

Tailwind CSS loaded via CDN (configured inline in `index.html`). Brand palette: `#FDFCFC` background, `#F5F3F1` surface, black accent. Font: Space Mono (Google Fonts). Custom Tailwind brand colors are defined in the `<script>` block inside `index.html` — add new colors there, not in a config file.

### Path Alias

`@/` resolves to the repo root (configured in both `vite.config.ts` and `tsconfig.json`).

### Environment Variables

Required `.env` variables (all prefixed `VITE_` for frontend access):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `VITE_PADDLE_CLIENT_TOKEN` / `VITE_PADDLE_PRICE_ID`

Supabase service role key and Paddle API key are used only in Edge Functions (not exposed to the browser).

### Deployment

Deployed on Vercel. `vercel.json` rewrites all routes to `index.html` for client-side routing. The Supabase Edge Function (`supabase/functions/create-portal-session/`) is deployed separately via Supabase CLI.

A `cancel-paddle-subscription` Edge Function is referenced in `pages/Dashboard.tsx` as a fallback but has no corresponding file in `supabase/functions/` — it is not deployed.

### Other Dependencies

- `react-helmet-async` — used in pages for SEO `<title>` and `<meta>` tags
- `jsPDF` — used in `pages/PromptDetail.tsx` for PDF export of prompt content
- `lucide-react` — icon library used throughout
