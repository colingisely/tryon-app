# Plano Definitivo: Sistema de Assinatura e Billing da Reflexy

## Contexto — Por que reconstruir

O sistema atual tem falhas estruturais que não se resolvem com patches:

1. **Múltiplos caminhos de pagamento** — Existem 3 rotas paralelas (`create-checkout`, `activate-subscription`, `link-session`) que tentam resolver o mesmo problema de formas diferentes. Isso cria inconsistência e bugs impossíveis de rastrear.
2. **Nenhuma forma de upgrade para usuários existentes** — Botões "Fazer upgrade" apontam para `/planos` (404). Studio Pro e Analytics também.
3. **Dashboard quebra para contas sem plano** — Erro "Cannot coerce result to single JSON object" quando `plan_id` é null.
4. **Confusão de slugs** — Código usa `preview` e `free` alternadamente para o mesmo conceito.
5. **Emails de confirmação não funcionam** — Nenhuma notificação chega ao usuário após assinatura.
6. **Sem página de gerenciamento** — Impossível visualizar, trocar ou cancelar plano.

**Referências pesquisadas:** Claude.ai, Vercel, Linear, Jasper AI, Stripe docs, ElevenLabs. Todas usam Auth-First + Stripe Customer Portal.

---

## Decisão #1 — Auth-First (e por quê)

**Cadastro ANTES do pagamento. Sempre.**

### Por que Auth-First e não Payment-First?

| | Payment-First (atual) | Auth-First (proposto) |
|---|---|---|
| **Stripe cria customer** | Sem userId → duplicatas por email | Com userId → 1:1 com merchant |
| **Webhook identifica usuário** | Busca por email (ambíguo) | `client_reference_id` = userId (exato) |
| **Upgrade de plano** | Não funciona (sem vínculo) | Funciona (userId já existe no Stripe) |
| **Empresas que usam** | Nenhuma relevante | Claude, Vercel, Linear, Loom |

**Fluxo universal:**
```
Landing → Signup/Login → Stripe Checkout (com userId) → Webhook ativa plano → Dashboard
```

---

## Decisão #2 — Stripe Customer Portal para gestão

Em vez de construir UI custom para upgrade/downgrade/cancelamento, usar o **Stripe Customer Portal** (solução nativa do Stripe):

- Upgrade e downgrade de plano
- Trocar cartão de crédito
- Baixar faturas/notas fiscais
- Cancelar assinatura
- Proration automática

**Justificativa:** Linear e Vercel usam abordagem similar. Zero manutenção, battle-tested, pronto para usar.

**Configuração necessária (no Stripe Dashboard, não em código):**
1. Settings → Customer Portal → Ativar
2. Listar os produtos/preços que podem ser trocados
3. Permitir cancelamento
4. Definir branding (logo Reflexy, cores)
5. Return URL: `https://www.reflexy.co/settings`

---

## Decisão #3 — Estrutura de planos (manter os 5 atuais)

Manter a estrutura atual pois já está configurada no Stripe e no banco:

| Plano | Slug | Preço | Fast Credits | Premium Credits | Features |
|-------|------|-------|-------------|----------------|----------|
| Free | `free` | $0 | 10/mês | 0 | Widget básico |
| Starter | `starter` | $19/mês | 100/mês | 5/mês | +Studio Pro, +Leads |
| Growth | `growth` | $39/mês | 300/mês | 10/mês | +Analytics avançado |
| Pro | `pro` | $99/mês | 800/mês | 20/mês | +Suporte prioritário |
| Enterprise | `enterprise` | Custom | Custom | Custom | +Remove badge, +SLA |

**Mudança crítica:** Eliminar o slug `preview`. Onde aparece `preview`, trocar para `free`.

---

## Fluxos Completos (cada cenário)

### Fluxo A — Novo usuário → Plano Free
```
1. Landing → clica "Experimentar gratuitamente"
2. → /signup (sem param de plano)
3. Cria conta Supabase Auth
4. Insere merchant com plan_id = free, subscription_status = null
5. Envia email de boas-vindas
6. → /dashboard (acesso liberado: free sempre tem acesso)
```

### Fluxo B — Novo usuário → Plano pago
```
1. Landing → clica "Assinar Starter" (ou Growth/Pro)
2. → /signup?plan=starter
3. Cria conta Supabase Auth + merchant (plan_id = free temporariamente)
4. Detecta ?plan=starter → chama create-checkout com userId
5. → Stripe Checkout (userId no client_reference_id)
6. Paga → checkout.session.completed webhook
7. Webhook: atualiza merchant (plan_id=starter, status=active, créditos=100/5)
8. Envia email de confirmação de assinatura
9. → /dashboard?payment=success (badge "Starter", créditos ativos)
```

### Fluxo C — Novo usuário → Plano pago (já tem conta)
```
1. Landing → clica "Assinar Pro"
2. → /signup?plan=pro
3. Tenta criar conta → detecta email existente
4. → /login?plan=pro (redireciona automaticamente)
5. Faz login → detecta ?plan=pro → chama create-checkout com userId
6. → Stripe Checkout → paga → webhook → plano ativado
7. Envia email de confirmação
8. → /dashboard?payment=success
```

### Fluxo D — Usuário logado → Upgrade (NOVO — não existe hoje)
```
1. Dashboard → clica "Fazer upgrade" OU vai para Settings → "Gerenciar plano"
2. Abre Stripe Customer Portal (create-portal-session)
3. Usuário troca de plano dentro do Portal Stripe
4. Stripe dispara customer.subscription.updated webhook
5. Webhook: atualiza plan_id, reseta créditos para novo plano
6. Envia email de confirmação de upgrade
7. Usuário volta para /settings (return_url do portal)
```

### Fluxo E — Usuário logado → Downgrade/Cancelamento
```
1. Settings → "Gerenciar plano" → Stripe Customer Portal
2. Escolhe downgrade ou cancelamento
3. Stripe agenda mudança para fim do período
4. Webhook customer.subscription.updated: status = 'canceling'
5. Envia email de confirmação (acesso até DD/MM/YYYY)
6. No fim do período: customer.subscription.deleted webhook
7. Merchant → plan_id = free, créditos resetados para 10/0
```

### Fluxo F — Usuário sem merchant record (edge case)
```
1. Usuário existe no Supabase Auth mas sem registro na tabela merchants
2. Dashboard detecta ausência (query retorna 0 rows)
3. Cria merchant automaticamente com plan_id = free
4. Mostra dashboard normalmente (self-healing)
```

---

## Regras de Créditos em Mudanças de Plano

| Evento | Ação nos créditos |
|--------|-------------------|
| **Nova assinatura** | Set para alocação do novo plano |
| **Upgrade** (preço maior) | **SOMAR** créditos do novo plano aos restantes. Ex: Growth com 50 restantes → Pro = 50 + 800 = 850 |
| **Downgrade** (preço menor) | Mantém créditos atuais até fim do ciclo; no próximo ciclo, creditação do novo plano |
| **Cancelamento** | Acesso mantido até fim do período; depois set para Free (0/0). Os 10 créditos do Free são concedidos apenas uma vez (primeiro acesso), sem renovação mensal. |
| **Renovação mensal** | Set para alocação do plano atual (créditos não acumulam entre ciclos). Plano Free NÃO renova créditos. |
| **Créditos não utilizados** | Expiram no fim do ciclo (não acumulam, exceto no momento do upgrade) |

---

## Emails Obrigatórios

| Momento | Email | Função existente? |
|---------|-------|-------------------|
| Após cadastro | Boas-vindas | `sendWelcomeEmail()` ✅ existe |
| Após pagamento | Confirmação de assinatura | `sendSubscriptionEmail()` ✅ existe mas não dispara |
| Após upgrade | Confirmação de upgrade | Usar `sendSubscriptionEmail()` com label do plano |
| Após cancelamento | Confirmação de cancelamento | ❌ CRIAR `sendCancellationEmail()` |
| Pagamento falhou | Aviso de falha | ❌ CRIAR `sendPaymentFailedEmail()` |
| Renovação mensal | Recibo | Opcional (Stripe já envia) |

---

## Arquivos a Modificar/Criar

### MODIFICAR

**1. `app/signup/page.tsx`** — Simplificar
- Remover lógica de `intent=checkout` (complexidade desnecessária)
- Novo comportamento: se `?plan=X` existe e X ≠ free → após criar conta, chamar `create-checkout` e redirecionar para Stripe
- Se `?plan=free` ou sem param → redirecionar para `/dashboard`
- Eliminar referências a `preview`
- Eliminar lógica de `session_id` e `link-session` (payment-first morto)

**2. `app/login/page.tsx`** — Simplificar
- Se `?plan=X` existe → após login, chamar `create-checkout` e redirecionar para Stripe
- Eliminar `fromPayment`, `sessionId`, `link-session`
- Eliminar refs complexos (não mais necessários com simplificação)

**3. `app/dashboard/page.tsx`** — Fix gate + upgrade CTAs
- **Self-healing**: se query retorna 0 rows, criar merchant com free plan
- **Gate simplificado**: `subscription_status === 'active'` OU `planSlug === 'free'` → acesso
- Todos os CTAs de "Fazer upgrade" → abrir Stripe Customer Portal (se tem stripe_customer_id) OU ir para `/#pricing` (se não tem)

**4. `app/studio/page.tsx`** — Fix upgrade CTA
- Trocar `/planos` → chamar `handleUpgrade()` (abre portal ou pricing)

**5. `app/analytics/page.tsx`** — Fix upgrade CTA
- Trocar `/planos` → chamar `handleUpgrade()` (abre portal ou pricing)

**6. `app/settings/page.tsx`** — Adicionar seção "Plano & Faturamento"
- Mostrar: plano atual, créditos restantes, data de renovação
- Botão "Gerenciar plano" → abre Stripe Customer Portal
- Botão "Fazer upgrade" → abre Stripe Customer Portal (se subscriber) OU `/#pricing` (se free)

**7. `app/api/payments/create-checkout/route.ts`** — Hardening
- OBRIGAR `userId` (rejeitar request sem userId)
- Antes de criar checkout, verificar se merchant já tem `stripe_customer_id` → usar `customer` em vez de `customer_email` (evita duplicata Stripe)
- `client_reference_id` = userId (já existe)

**8. `app/api/payments/webhook/route.ts`** — Fix + emails
- `checkout.session.completed`: usar `client_reference_id` OU `metadata.userId` para encontrar merchant (já funciona parcialmente)
- Garantir que `sendSubscriptionEmail()` é chamado com sucesso
- `customer.subscription.updated`: detectar upgrade/downgrade, enviar email
- `customer.subscription.deleted`: downgrade para free, enviar email
- `invoice.payment_failed`: enviar email de falha

**9. `components/landing/reflexy/components/sections.jsx`** — Pricing CTAs
- "Experimentar gratuitamente" → `/signup` (sem plan param, cria conta free)
- "Assinar Starter/Growth/Pro" → `/signup?plan=starter` (etc.)
- Trocar qualquer referência a `preview` por `free`

**10. `lib/plan-features.ts`** — Eliminar preview
- Se `slug === 'preview'` → tratar como `free`

**11. `lib/email.ts`** — Adicionar emails faltantes
- `sendCancellationEmail(to, planName, accessUntilDate)`
- `sendPaymentFailedEmail(to, planName)`

### CRIAR

**12. `app/api/payments/create-portal-session/route.ts`** — NOVO
```typescript
// Rota autenticada
// 1. Busca merchant do usuário logado
// 2. Verifica se tem stripe_customer_id
// 3. stripe.billingPortal.sessions.create({ customer, return_url })
// 4. Retorna { url }
```

### REMOVER (código morto)

**13. `app/api/payments/activate-subscription/route.ts`** — DELETAR
- Não mais necessário (auth-first elimina a necessidade)

**14. `app/api/payments/link-session/route.ts`** — DELETAR
- Não mais necessário (payment-first eliminado)

---

## Ordem de Implementação

### Fase 1 — Correções críticas (primeiro)
1. Fix dashboard self-healing (merchant não existe → criar)
2. Fix dashboard gate (free = acesso, active = acesso)
3. Eliminar slug `preview` → `free` em todo codebase
4. Fix todos os `/planos` → portal ou pricing

### Fase 2 — Stripe Customer Portal
1. Criar `create-portal-session` API route
2. Adicionar botão "Gerenciar plano" em Settings
3. Configurar Portal no Stripe Dashboard

### Fase 3 — Simplificar signup/login
1. Reescrever signup: `?plan=X` → create-checkout após cadastro
2. Reescrever login: `?plan=X` → create-checkout após login
3. Remover activate-subscription e link-session

### Fase 4 — Emails
1. Garantir que webhook envia emails em cada evento
2. Criar `sendCancellationEmail` e `sendPaymentFailedEmail`
3. Testar entrega de cada email

### Fase 5 — Testes end-to-end
1. Novo usuário → free → dashboard ✓
2. Novo usuário → paid → Stripe → dashboard com plano ativo ✓
3. Usuário existente → login → upgrade via portal ✓
4. Upgrade de plano → créditos resetados ✓
5. Cancelamento → acesso até fim do período ✓
6. Email recebido em cada etapa ✓

---

## Verificação

- Testar com `stripe listen --forward-to localhost:3000/api/payments/webhook` para webhooks locais
- Usar cartão de teste `4242 4242 4242 4242`
- Verificar cada email no Resend dashboard
- Confirmar que créditos são resetados corretamente no Supabase
- Testar edge case: usuário sem merchant record → self-healing
