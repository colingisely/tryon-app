-- ============================================
-- REFLEXY - ANALYTICS EVENTS TABLE
-- ============================================

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  product_id TEXT,
  product_name TEXT,
  product_image_url TEXT,
  session_id TEXT,
  user_fingerprint TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_merchant_id ON analytics_events(merchant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Merchants can view their own analytics
CREATE POLICY "Merchants can view own analytics" ON analytics_events 
  FOR SELECT 
  USING (auth.uid() = merchant_id);

-- Allow API to insert events (will be validated by API key in application layer)
CREATE POLICY "Allow insert for authenticated users" ON analytics_events 
  FOR INSERT 
  WITH CHECK (true);

-- ============================================
-- EVENT TYPES:
-- - tryon_initiated: Modal opened
-- - tryon_completed: Image generated successfully
-- - tryon_failed: Generation failed
-- - product_added_to_cart: User clicked "Add to Cart" after try-on
-- - modal_closed: User closed the modal
-- - time_spent: Periodic event with time spent data
-- ============================================
