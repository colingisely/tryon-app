-- ============================================
-- TRYON APP - SAAS DATABASE SCHEMA
-- ============================================

-- 1. PLANS TABLE
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  price_brl DECIMAL(10,2) NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  fast_credits_monthly INTEGER NOT NULL DEFAULT 0,
  premium_credits_monthly INTEGER NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MERCHANTS TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  store_name TEXT,
  store_url TEXT,
  api_key TEXT UNIQUE NOT NULL,
  plan_id UUID REFERENCES plans(id),
  subscription_status TEXT DEFAULT 'trial', -- trial, active, cancelled, expired
  subscription_started_at TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  fast_credits_remaining INTEGER DEFAULT 0,
  premium_credits_remaining INTEGER DEFAULT 0,
  fast_credits_used_total INTEGER DEFAULT 0,
  premium_credits_used_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USAGE LOG TABLE
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  mode TEXT NOT NULL, -- 'fast' or 'premium'
  credits_used INTEGER NOT NULL,
  model_image_url TEXT,
  product_image_url TEXT,
  result_image_url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRANSACTIONS TABLE (for payment tracking)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  amount_brl DECIMAL(10,2),
  amount_usd DECIMAL(10,2),
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method TEXT, -- stripe, mercadopago, etc
  payment_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_merchants_api_key ON merchants(api_key);
CREATE INDEX IF NOT EXISTS idx_merchants_plan_id ON merchants(plan_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_merchant_id ON usage_logs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_id ON transactions(merchant_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Plans: Everyone can read, only admins can modify
CREATE POLICY "Plans are viewable by everyone" ON plans FOR SELECT USING (true);

-- Merchants: Users can only see and manage their own data
CREATE POLICY "Merchants can view own data" ON merchants FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Merchants can insert own data" ON merchants FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Merchants can update own data" ON merchants FOR UPDATE USING (auth.uid() = id);

-- Usage logs: Users can only see and create their own logs
CREATE POLICY "Users can view own usage logs" ON usage_logs FOR SELECT USING (auth.uid() = merchant_id);
CREATE POLICY "Users can insert own usage logs" ON usage_logs FOR INSERT WITH CHECK (auth.uid() = merchant_id);

-- Transactions: Users can only see and create their own transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = merchant_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = merchant_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate unique API key
CREATE OR REPLACE FUNCTION generate_api_key() RETURNS TEXT AS $$
BEGIN
  RETURN 'tk_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly credits
CREATE OR REPLACE FUNCTION reset_monthly_credits() RETURNS void AS $$
BEGIN
  UPDATE merchants m
  SET 
    fast_credits_remaining = p.fast_credits_monthly,
    premium_credits_remaining = p.premium_credits_monthly,
    updated_at = NOW()
  FROM plans p
  WHERE m.plan_id = p.id
    AND m.subscription_status = 'active';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA: PLANS
-- ============================================

INSERT INTO plans (name, slug, price_brl, price_usd, fast_credits_monthly, premium_credits_monthly, features) VALUES
  ('Free', 'free', 0, 0, 100, 0, '["100 try-ons rápidos/mês", "Modo Premium: 0", "Logo \"Powered by TryOn\"", "Suporte por email"]'),
  ('Starter', 'starter', 99, 19, 500, 10, '["500 try-ons rápidos/mês", "10 fotos Premium/mês", "Sem logo", "Suporte prioritário"]'),
  ('Pro', 'pro', 249, 49, 2000, 50, '["2.000 try-ons rápidos/mês", "50 fotos Premium/mês", "Sem logo", "Suporte prioritário", "Analytics avançado"]'),
  ('Enterprise', 'enterprise', 599, 119, 999999, 300, '["Try-ons rápidos ilimitados", "300 fotos Premium/mês", "White-label", "Suporte dedicado", "API customizada"]')
ON CONFLICT (slug) DO NOTHING;

