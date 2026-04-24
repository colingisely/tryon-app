# Reflexy — Roadmap

**Última atualização:** 21 de abril de 2026
**Fonte canônica:** Notion → Marcos do Roadmap (data source `f2db4be1-ba0d-46c0-83f7-7bdc1b5a5179`)

Este arquivo é um espelho do Notion Hub Central. Qualquer mudança de fase/marco deve ser feita **primeiro** no Notion, depois refletida aqui.

---

## Fase 0 — Auditoria · **Concluído** ✅

**Objetivo:** identificar bugs críticos, zerar débitos P0, consolidar brand system.

- [x] Auditoria total end-to-end (T01)
- [x] Fix BUG-008 — Settings mostrava plano errado (silent catch)
- [x] Fix BUG-015 — analytics_events zerado (3 causas-raiz)
- [x] Fix BUG-018 — "Produtos Mais Provados" mostrava "unknown"
- [x] Fix BUG-019 — Analytics page contagem inconsistente
- [x] Brand System Canon consolidado (substitui V5/V6 — doc canon em Notion 2026-04-21)

---

## Fase 0.5 — Polimento · **Em andamento** 🟡

**Objetivo:** harmonizar visual + UX entre landing e páginas internas, fechar débitos visuais/segurança antes do outbound.

**Concluído:**
- [x] T11 — Editar preços landing (Studio Pro $0.50/render)
- [x] T20 — Reorganizar Notion como Hub Central V1
- [x] T31 — Harmonizar visual /studio com layout /admin (PR #39)
- [x] T13 — Brand V6 nas páginas de erro (404/500/global-error) (PR #40)
- [x] T07 — Limpar branches stale

**Em andamento:**
- [ ] T15 — Substituir 6 modelos recomendados /studio (PR pendente merge)
- [ ] T14 — Onboarding flow 5 emails (welcome + banner prontos; faltam D+1, D+3, D+7, D+14)
- [ ] T08 — Atualizar ROADMAP.md e CHECKPOINT.md (este PR)
- [ ] T26 — Setup completo redes sociais (bloqueador de outbound)
- [ ] T27 — Instagram bio + 9 posts grid
- [ ] T28 — LinkedIn pessoal Gi

**Não iniciadas (priorizar):**
- [ ] T04 — Configurar branding Stripe (logo + cores)
- [ ] T06 — Preencher Pitch Deck
- [ ] T09 — Remover /admin com senha hardcoded ⚠️ segurança
- [ ] T10 — Pacote extra de créditos avulsos
- [ ] T12 — Marca d'água no provador (plano Free)
- [ ] T18 — Brand System PDF público
- [ ] **Resíduos de cores antigas** — substituir `#7C3AED`/`#5B21B6`/`#C084FC` pelo gradient canon `#2B1250 → #7050A0` em dashboard, analytics, landing
- [ ] Padronizar `--dusk` em `#A09CC0` (landing usa `#B8B4D4` divergente)
- [ ] Atualizar headers "Brand System V5" nos comments de `settings/page.tsx` e `studio/page.tsx`

---

## Fase 1 — Shopify App · **Não iniciada** ⚪

**Objetivo:** construir app oficial para listagem na Shopify App Store.

- [ ] T19 — Construir Shopify App oficial (OAuth + admin embeddable)
- [ ] Materials para Shopify App Store (screenshots, copy, vídeo demo)
- [ ] Submeter Shopify App para review
- [ ] Alertas de uso (80% e 100% créditos)
- [ ] Widget V2 (adaptação automática de tema, UX aprimorada)

**Bloqueador:** Fase 0.5 precisa estar mais madura antes.

---

## Fase 2 — Lançamento · **Em andamento** 🟡 (paralelo a 0.5)

**Objetivo:** primeiros MRR reais via outbound + social, sem esperar App Store.

- [x] T03 — Recarregar OpenAI ($5)
- [x] T05 — Atualizar snippet Shopify loja demo
- [x] T16 — Loja demo Shopify operacional

**Em andamento (30 dias):**
- [ ] T22 — 30 emails outbound semana 1
- [ ] T23 — Posts em 3 grupos Telegram + 2 grupos FB
- [ ] T24 — Vídeo Loom 30s demo widget
- [ ] T25 — Imagem 1080×1080 antes/depois
- [ ] T29 — Conta Telegram + entrar em 5-10 grupos
- [ ] T30 — Seguir 100 contas estratégicas Instagram

**Marcos:**
- [ ] Lançamento Shopify App Store (depende Fase 1)
- [ ] Lançamento Product Hunt

**Bloqueada:**
- [ ] T21 — Recarga automática OpenAI/FASHN (requer MRR sustentável > $50/mês)

---

## Fase 3 — Retenção · **Futura** ⚪

**Objetivo:** reduzir churn, aumentar LTV, diversificar integração.

- [ ] API pública documentada (OpenAPI spec)
- [ ] A/B testing de CTAs e pricing
- [ ] Chat in-app (Crisp ou Intercom)
- [ ] Integração VTEX / WooCommerce
- [ ] White-label para agências
- [ ] Try-on para acessórios
- [ ] Realidade aumentada (AR)

---

## Métricas de Sucesso

| Prazo | Meta |
|---|---|
| 30 dias | 0 bugs P0 abertos, 1-2 pagantes reais (primeiro MRR fora admin) |
| 60 dias | Shopify App submetido, 8 pagantes, ~$300 MRR |
| 90 dias | 25 pagantes, ~$1,000 MRR |

---

## Stack de Referência

- **Framework:** Next.js 16 App Router, React 19, TypeScript, Bun runtime
- **Backend:** Supabase (Postgres + Auth + RLS), project `bmpuiawpppfjyddevtml`
- **Pagamentos:** Stripe (subscriptions + Customer Portal + webhooks)
- **IA:** FASHN.ai (tryon-v1.6 / tryon-max) + OpenAI GPT-4.1-mini (categoria)
- **Hosting:** Vercel (project `prj_K6OTPo2q27bCVoY3xB71C5e8FGkV`)
- **Observability:** Sentry, Resend, Scheduled Tasks
