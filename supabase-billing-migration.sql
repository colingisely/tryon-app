-- ============================================================
-- REFLEXY — Billing Migration
-- Execute no Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── 1. Colunas de billing na tabela merchants ────────────────

ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS stripe_customer_id        TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id    TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS subscription_started_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS overage_status            TEXT    NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS overage_cap_cents         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overage_used_cents        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overage_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_failed_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_at              TIMESTAMPTZ;

-- ── 2. Coluna stripe_price_id na tabela plans ────────────────

ALTER TABLE plans
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT UNIQUE;

-- ── 3. Atualizar seed de planos para bater com a landing page ─

INSERT INTO plans (name, slug, price_brl, price_usd, fast_credits_monthly, premium_credits_monthly, features)
VALUES
  ('Free',       'free',       0,   0,   10,  0,  '["10 provas/mês","Marca Reflexy visível","Suporte padrão"]'),
  ('Starter',    'starter',    99,  19,  100, 5,  '["100 provas/mês","5 renders Studio Pro/mês","Suporte padrão"]'),
  ('Growth',     'growth',     199, 39,  300, 10, '["300 provas/mês","10 renders Studio Pro/mês","Analytics avançado","Suporte prioritário"]'),
  ('Pro',        'pro',        499, 99,  800, 20, '["800 provas/mês","20 renders Studio Pro/mês","Funil completo","Suporte prioritário"]'),
  ('Enterprise', 'enterprise', 0,   0,   0,   0,  '["Volume customizado","Suporte dedicado","Integrações customizadas"]')
ON CONFLICT (slug) DO UPDATE SET
  name                    = EXCLUDED.name,
  price_brl               = EXCLUDED.price_brl,
  price_usd               = EXCLUDED.price_usd,
  fast_credits_monthly    = EXCLUDED.fast_credits_monthly,
  premium_credits_monthly = EXCLUDED.premium_credits_monthly,
  features                = EXCLUDED.features,
  updated_at              = NOW();

-- ── 4. stripe_webhook_log — deduplicação de eventos ──────────

CREATE TABLE IF NOT EXISTS stripe_webhook_log (
  id         BIGSERIAL    PRIMARY KEY,
  event_id   TEXT         NOT NULL,
  event_type TEXT         NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT stripe_webhook_log_event_id_unique UNIQUE (event_id)
);

ALTER TABLE stripe_webhook_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_log_created_at
  ON stripe_webhook_log (created_at);

-- ── 5. billing_suspension_queue ──────────────────────────────

CREATE TABLE IF NOT EXISTS billing_suspension_queue (
  id          BIGSERIAL   PRIMARY KEY,
  merchant_id UUID        NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  suspend_at  TIMESTAMPTZ NOT NULL,
  reason      TEXT        NOT NULL DEFAULT 'payment_failed',
  processed   BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT billing_suspension_queue_merchant_id_unique UNIQUE (merchant_id)
);

ALTER TABLE billing_suspension_queue ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_billing_suspension_queue_pending
  ON billing_suspension_queue (suspend_at)
  WHERE processed = false;

-- ── 6. billing_notifications ─────────────────────────────────

CREATE TABLE IF NOT EXISTS billing_notifications (
  id          BIGSERIAL   PRIMARY KEY,
  merchant_id UUID        NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  event       TEXT        NOT NULL,
  payload     JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE billing_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view own billing notifications"
  ON billing_notifications FOR SELECT
  USING (auth.uid() = merchant_id);

CREATE INDEX IF NOT EXISTS idx_billing_notifications_merchant_id
  ON billing_notifications (merchant_id, created_at DESC);

-- ── 7. Índices extras em merchants ───────────────────────────

CREATE INDEX IF NOT EXISTS idx_merchants_stripe_customer_id
  ON merchants (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_merchants_overage_status
  ON merchants (overage_status);
