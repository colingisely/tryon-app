# CHECKPOINT v3.0 — Sistema de Billing Unificado + Bug Fixes

**Data**: 02/04/2026
**Branch**: main
**Status**: Em produção (reflexy.co)

---

## O que mudou desde o v2.6

### 1. Sistema de Créditos Unificado
O modelo de créditos separados (fast_credits + premium_credits) foi substituído por um pool unificado:

| Plano | Preço | Créditos/mês | Try-ons rápidos | Studio Pro |
|-------|-------|-------------|-----------------|------------|
| Free (Preview) | $0 | 10 | 10 | 2 |
| Starter | $19/mês | 150 | 150 | 37 |
| Growth | $39/mês | 320 | 320 | 80 |
| Pro | $99/mês | 800 | 800 | 200 |

**Conversão**: 1 crédito = 1 prova rápida · 4 créditos = 1 Studio Pro

### 2. Billing via Stripe
- Checkout com `create-checkout-session` (auth-first: requer login antes de pagar)
- Webhooks: `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
- Customer Portal para gerenciar assinatura
- Credit ledger para auditoria de cada mudança de crédito

### 3. Bug Fixes Críticos (Abril 2026)
- **Settings query**: Removia `widget_enabled` e `credits_monthly` da query (colunas inexistentes na tabela merchants), causando fallback silencioso para Free/0cr
- **CTA upgrade**: Corrigido — agora abre Stripe Portal para assinantes, /#pricing para free
- **Analytics URL**: `ReflexyAnalytics` usava URL relativa `/api/analytics` — corrigido para URL absoluta derivada do script src
- **Landing page pricing**: Atualizado para modelo de créditos unificado (era try-ons + Studio Pro separados)
- **Branches limpas**: 37 branches mergeadas removidas

---

## Estrutura do Projeto

```
tryon-app/
├── app/
│   ├── dashboard/page.tsx       # Dashboard com créditos unificados
│   ├── settings/page.tsx        # Settings com Plano & Faturamento
│   ├── studio/page.tsx          # Studio Pro (4 créditos por geração)
│   ├── analytics/page.tsx       # Analytics comportamental
│   ├── login/page.tsx           # Login
│   ├── signup/page.tsx          # Signup
│   ├── backoffice/              # Admin (email allowlist)
│   └── api/
│       ├── tryon/route.ts       # API de try-on (fast + premium)
│       ├── payments/
│       │   ├── create-checkout/route.ts
│       │   ├── create-portal-session/route.ts
│       │   └── webhook/route.ts  # Stripe webhooks
│       └── cron/
│           └── suspensions/route.ts  # Cron diário 03:00 UTC
├── components/landing/reflexy/  # Landing page (PT + EN)
├── public/
│   └── virtual-tryon.js         # Widget Shopify (v2.5)
├── ROADMAP.md
└── CHECKPOINT.md                # Este arquivo
```

---

## Variáveis de Ambiente (Vercel)

```
FASHN_API_KEY=<chave_fashn>
OPENAI_API_KEY=<chave_openai>
NEXT_PUBLIC_SUPABASE_URL=<url_supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
STRIPE_SECRET_KEY=<stripe_secret>
STRIPE_WEBHOOK_SECRET=<webhook_secret>
RESEND_API_KEY=<resend_key>
SENTRY_DSN=<sentry_dsn>
```

---

## Como Testar

### Widget na Shopify
1. Acesse um produto na demo store (tryonapp-2.myshopify.com)
2. Clique em "Provar em Mim"
3. Faça upload de uma foto
4. Gere o try-on (consome 1 crédito)

### Dashboard
1. Login em reflexy.co/login
2. Verifique créditos e plano no dashboard
3. Settings → Plano & Faturamento deve mostrar plano correto
4. CTA "Gerenciar plano" deve abrir Stripe Portal

### Billing
1. Signup → selecionar plano → Stripe Checkout
2. Webhook processa pagamento e ativa créditos
3. Customer Portal permite upgrade/downgrade/cancelamento

---

## Custos por Geração

| Modo | Créditos | Tempo | Custo API |
|------|----------|-------|-----------|
| **Rápido (Fast)** | 1 | ~15s | ~$0.075 |
| **Studio Pro** | 4 | ~50s | ~$0.30 |

---

## Próximos Passos

1. Brand system: unificar visual das páginas internas com a landing page
2. Responsividade mobile em todas as páginas
3. Construir Shopify App oficial (OAuth + admin embeddable)
4. Onboarding email drip (5 emails)
5. Shopify App Store listing

---

**Última atualização**: 2 de abril de 2026
