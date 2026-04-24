# CHECKPOINT — Snapshot do Estado

**Data:** 21 de abril de 2026
**Branch de main:** `2168046` (PR #40 `error-pages-brand-v6`)
**Em produção:** reflexy.co / www.reflexy.co

---

## Estado em uma frase

Produto funciona ponta-a-ponta. 4 P0 fechados em 19-20/abr (BUG-008/015/018/019). Refactor visual /studio + páginas de erro mergeados em 21/abr. Foco agora: outbound social + primeiro MRR real.

---

## Clientes Pagantes (verificado via SQL em 20/abr)

| Email | Plano | MRR |
|---|---|---|
| reflexy.co@gmail.com | Pro | $99 |
| colingisely@... | Growth | $39 |
| rumktconta02 | Starter | $19 |
| **TOTAL** | | **$157** |

Plus: `gcdigitaldesigner@gmail.com` (admin, sem Stripe — BUG-013 workaround).

Zero pagante *real* (todos são contas de teste/dogfood da Gi).

---

## Mudanças recentes merged em main

| PR | Descrição | Commit |
|---|---|---|
| #37 | fix billing (signup credits, webhook period_end, email text) | `652d96e` |
| #38 | widget URL, event type mismatch, install snippet, logo PNGs | `d288ea0` |
| #39 | refactor(studio) — harmonizar visual com layout /admin | `9c2611e` |
| #40 | refactor(brand) — error pages escala app-chrome + ReflexGem | `63c8e8c` |

**PRs abertos aguardando merge:**
- `feat/studio-modelos-recomendados` (T15) — 6 fotos catálogo corpo inteiro

---

## Brand System — Canon Final (2026-04-21)

Substitui V5/V6. **Fonte de verdade:** Notion (subpágina de BRAND `349ea2196f5d8125bd69d3cc498f6134`).

**Tokens canônicos:**
- Surfaces: `--abyss #06050F`, `--onyx #0F0D1E`, `--onyx-mid #161330`
- Brand: `--plum #2B1250`, `--mauve #7050A0`, `--lavender #B8AEDD`
- Texto: `--mist #EDEBF5` (claro), `--dusk #A09CC0` (muted)
- Semantic: `--verdigris #0CC89E` (sucesso), `--cobalt #3B82F6` (volume), `--warning #FFB432`, `--error #FF5A5A`
- Gradient CTA: `linear-gradient(135deg, #2B1250 0%, #7050A0 100%)`
- Fontes: Bricolage Grotesque (display), Instrument Serif (editorial), DM Sans (body), IBM Plex Mono (data/eyebrow)

**Débito técnico conhecido:**
- Resíduos `#7C3AED`/`#5B21B6`/`#C084FC` em `dashboard/page.tsx`, `analytics/page.tsx`, `ReflexyLanding.jsx` → substituir pelo gradient canon
- `--dusk` divergente: landing usa `#B8B4D4`, internas `#A09CC0` → padronizar
- Headers "Brand System V5" em `settings/page.tsx:5` e `studio/page.tsx:5` → atualizar comentários

---

## Estrutura do Projeto

```
tryon-app/
├── app/
│   ├── dashboard/page.tsx       # Dashboard com créditos unificados
│   ├── settings/page.tsx        # Settings com Plano & Faturamento
│   ├── studio/page.tsx          # Studio Pro refactor visual /admin
│   ├── analytics/page.tsx       # Analytics comportamental
│   ├── login/page.tsx           # Login + exports GrainOverlay/AmbientGlow
│   ├── signup/page.tsx          # Signup
│   ├── not-found.tsx            # 404 Brand V6
│   ├── error.tsx                # 500 runtime Brand V6
│   ├── global-error.tsx         # global error Brand V6
│   ├── admin/page.tsx           # ⚠️ T09 pendente: senha hardcoded
│   ├── backoffice/              # Admin (email allowlist)
│   └── api/
│       ├── tryon/route.ts       # Fast + Premium (FASHN)
│       ├── analytics/route.ts   # SERVICE_ROLE_KEY + CORS
│       ├── studio/
│       ├── payments/
│       │   ├── create-checkout-session/route.ts
│       │   ├── create-portal-session/route.ts
│       │   └── webhook/route.ts
│       └── cron/suspensions/route.ts
├── components/
│   ├── ui/ReflexGem.tsx         # Componente oficial do logo (facetado)
│   ├── ui/InternalFooter.tsx
│   └── dashboard/OnboardingBanner.tsx
├── public/
│   ├── virtual-tryon.js         # Widget Shopify
│   ├── favicon.svg · reflexy-gem.svg
│   └── models/recomendados/     # 6 fotos catálogo (T15)
├── ROADMAP.md
└── CHECKPOINT.md
```

---

## Pricing Canônico

| Plano | Preço | Créditos/mês | Try-ons rápidos | Studio Pro |
|---|---|---|---|---|
| Free | $0 | 10 | 10 | 2 |
| Starter | $19 | 150 | 150 | 37 |
| Growth | $39 | 320 | 320 | 80 |
| Pro | $99 | 800 | 800 | 200 |

**Conversão:** 1 crédito = 1 try-on fast · 4 créditos = 1 Studio Pro
**PAYG Studio Pro:** $0.50/render (interno, não marketing público)

**Tempos reais:**
- Fast: ~15s
- Premium (tryon-max): ~45s

---

## Bugs & Issues

**P0 resolvidos recentemente (19-21/abr):**
- BUG-008 Settings plano errado · BUG-015 analytics zerado · BUG-018 Products unknown · BUG-019 Analytics counts

**Aberto:**
- BUG-020 — duration_ms 0 em try-ons via JS de teste (P2, não bloqueia)
- BUG-013 — admin sem stripe_customer_id conta como "active" (workaround no daily standup)

**Segurança:**
- ⚠️ T09 — `/admin` tem senha hardcoded (ainda pendente, P0 segurança)
- RLS ativo em `credit_ledger` e `tryon_leads` (verificar se BUG-006 está fechado)

---

## Variáveis de Ambiente (Vercel)

```
FASHN_API_KEY=<...>
OPENAI_API_KEY=<...>  # Recarregado $5 em 20/abr
NEXT_PUBLIC_SUPABASE_URL=<...>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<...>
SUPABASE_SERVICE_ROLE_KEY=<...>
STRIPE_SECRET_KEY=<...>
STRIPE_WEBHOOK_SECRET=<...>
RESEND_API_KEY=<...>
SENTRY_DSN=<...>
```

---

## Como Testar

### Widget na Shopify
1. Demo store (`tryonapp-2.myshopify.com`), abrir produto
2. Click "Provar em Mim" → upload foto → gerar (1 crédito)

### Dashboard
1. Login em `reflexy.co/login`
2. Verificar créditos e plano no dashboard
3. Settings → Plano & Faturamento mostra plano correto
4. CTA "Gerenciar plano" abre Stripe Portal

### Studio Pro
1. Login como merchant com plano Starter+
2. `/studio` → escolher modelo (6 presets ou upload) + produto
3. Gerar (4 créditos)

### Billing
1. Signup → plano → Stripe Checkout
2. Webhook ativa créditos
3. Customer Portal permite upgrade/downgrade/cancel

---

## Comandos importantes

- **Dev local:** `bun dev` (Bun é o runtime padrão)
- **Deploy:** auto via Vercel quando push em `main`
- **Pasta crítica:** `/Users/giselycolin/tryon-app`

---

## Próximos passos (ordem recomendada)

1. **T15 merge** (PR aberto)
2. **T18 Brand System PDF público**
3. **T04 Stripe branding** (logo + cores no checkout)
4. **T09 Remover /admin hardcoded** ⚠️ segurança
5. **T26/T27/T28 Redes sociais** (bloqueador de outbound)
6. **T22/T23/T24/T25 Outbound 30 dias**
7. **T14 Emails D+1/D+3/D+7/D+14**

---

**Última atualização:** 21 de abril de 2026
