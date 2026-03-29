# Reflexy — Project Context

> **Internal package name:** `reflexy` (see `package.json`)
> **Vercel project:** `tryon-app`
> **Working directory:** `/Users/giselycolin/tryon-app`

---

## What is Reflexy?

Reflexy is a **B2B SaaS platform** that sells a **Virtual Try-On plugin for Shopify stores**. Merchants install a JavaScript widget on their Shopify store; shoppers upload a photo and see themselves wearing any product via AI image generation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, TypeScript) |
| Auth + DB | **Supabase** (Postgres + RLS + SSR helpers) |
| Deployment | **Vercel** (project `tryon-app`) |
| Payments | **Stripe** (checkout, webhooks, subscriptions) |
| AI – Try-On | **FASHN.ai** (`api.fashn.ai/v1/run`) — primary model |
| AI – Studio | **Replicate** + **Google Generative AI (Gemini)** |
| Styling | Tailwind CSS v4, Framer Motion |
| Charts | Recharts |

---

## Repository Layout

```
app/
  api/
    tryon/          # POST /api/tryon — Shopify plugin calls this
    studio/
      generate/     # Studio image generation (internal dashboard)
      history/      # Studio generation history
    billing/
      overage/      # Overage billing endpoints
    payments/
      create-checkout/    # Stripe checkout session
      activate-subscription/
      webhook/      # Stripe webhook handler
    analytics/      # Analytics API
    cron/
      suspensions/  # Daily cron: suspend delinquent accounts (runs 03:00 UTC)
    tmp/            # Temp/scratch routes
  dashboard/        # Merchant dashboard (post-login)
  studio/           # AI Studio page
  settings/         # Merchant settings
  analytics/        # Analytics page
  backoffice/       # Internal admin panel
  admin/            # Admin area
  login/ signup/    # Auth flows
  landing/          # Public landing page
  pricing/          # Public pricing page
  privacy/ terms/   # Legal pages

components/
  landing/          # Landing page components
  ui/               # Shared UI components

lib/
  supabase/
    client.ts       # Browser Supabase client
    server.ts       # Server-side Supabase client
  billing-check.ts  # Credit deduction + account suspension logic
  overage.ts        # Overage billing helpers
  storage.ts        # Supabase Storage helpers
  gemini.ts         # Google Generative AI client

types/              # Shared TypeScript types

supabase-schema.sql           # Full DB schema
supabase-billing-migration.sql
supabase-analytics-migration.sql
supabase-fix-policies.sql
vercel.json                   # Cron job config
```

---

## Database Schema (Supabase Postgres)

| Table | Purpose |
|---|---|
| `plans` | Subscription plans (name, slug, price BRL/USD, credits) |
| `merchants` | One row per merchant (extends `auth.users`) — stores API key, plan, credit balances, suspension state |
| `usage_logs` | Per-generation log (mode: `fast`\|`premium`, images, credits used) |
| `transactions` | Payment tracking (Stripe, MercadoPago) |

Key merchant fields: `api_key`, `plan_id`, `subscription_status` (`trial | active | cancelled | expired`), `fast_credits_remaining`, `premium_credits_remaining`, `overage_status`, `suspended_at`.

---

## Billing Model

- **Credit-based**: merchants buy plans that include monthly `fast_credits` and `premium_credits`.
- **Try-On modes**:
  - `fast` — uses FASHN.ai standard mode (fewer credits)
  - `premium` — uses FASHN.ai high-quality mode (more credits)
- **Overage**: handled by `lib/overage.ts`; accounts can be suspended via cron at `app/api/cron/suspensions`.
- **Stripe**: checkout sessions created at `/api/payments/create-checkout`; webhooks at `/api/payments/webhook`.

---

## Shopify Plugin Flow

1. Merchant adds Reflexy JS snippet to their Shopify theme.
2. Shopper opens try-on modal → uploads photo + product image is passed automatically.
3. Plugin calls `POST /api/tryon` with `X-API-Key: <merchant-api-key>`.
4. API authenticates merchant, calls FASHN.ai, returns result image URL.
5. Plugin shows result; usage is logged to `usage_logs`.

---

## Studio (Internal Feature)

Merchants on higher plans can access `/studio` — an internal AI image generation tool that uses **Replicate** and **Gemini** (not FASHN.ai). Separate credit pool (`fast_credits_remaining`).

---

## Environment Variables (required)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
FASHN_API_KEY
OPENAI_API_KEY          # Used in tryon route for garment analysis
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
CRON_SECRET             # Protects /api/cron/* routes
GOOGLE_GENERATIVE_AI_API_KEY  # Gemini (lib/gemini.ts)
REPLICATE_API_TOKEN
```

---

## Cron Jobs

| Schedule | Path | Purpose |
|---|---|---|
| `0 3 * * *` (03:00 UTC daily) | `/api/cron/suspensions` | Suspend accounts with unpaid overages |

---

## Key Conventions

- **App Router only** — no Pages Router. All routes are in `app/`.
- **Server Components by default**; client components use `'use client'` directive.
- **Supabase SSR**: use `lib/supabase/server.ts` in Server Components / Route Handlers; use `lib/supabase/client.ts` in Client Components.
- **Billing guard**: always call `checkBillingAndDeduct(merchantId, type)` from `lib/billing-check.ts` before invoking any AI generation.
- **Tailwind v4**: PostCSS-based, config in `tailwind.config.ts`.
- **Language**: codebase is Portuguese-first in comments and UI strings.
