-- ============================================
-- FIX: Add missing INSERT policies for merchants
-- ============================================

-- Allow authenticated users to insert their own merchant record
CREATE POLICY "Merchants can insert own data" ON merchants 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert their own usage logs
CREATE POLICY "Users can insert own usage logs" ON usage_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = merchant_id);

-- Allow authenticated users to insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = merchant_id);
