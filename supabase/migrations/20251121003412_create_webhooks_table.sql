-- =====================================================
-- Migration: Create Webhooks Table
-- Created: 2025-11-21T00:34:12Z
-- Tables: webhooks, webhook_deliveries
-- Purpose: Store webhook configurations and delivery logs
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: webhooks
-- Purpose: Store webhook configurations per agent
-- =====================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Webhook configuration
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT, -- HMAC secret for signing payloads
  enabled BOOLEAN DEFAULT true,
  
  -- Trigger configuration
  triggers JSONB DEFAULT '[]'::jsonb, -- Array of trigger events: ['session.completed', 'session.started', etc.]
  
  -- Payload configuration
  payload_template JSONB, -- Custom payload template
  
  -- Retry policy
  retry_policy JSONB DEFAULT '{"maxAttempts": 3, "backoffMultiplier": 2, "initialDelay": 1000}'::jsonb,
  
  -- Metadata
  last_delivery_status TEXT, -- 'success', 'failed', 'pending'
  last_delivery_at TIMESTAMPTZ,
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT webhooks_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT webhooks_url_valid CHECK (url ~* '^https?://')
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS webhooks_agent_id_idx ON webhooks(agent_id);
CREATE INDEX IF NOT EXISTS webhooks_user_id_idx ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS webhooks_enabled_idx ON webhooks(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS webhooks_last_delivery_at_idx ON webhooks(last_delivery_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_webhooks_updated_at ON webhooks;
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access webhooks for their own agents
CREATE POLICY "webhooks_select_own"
  ON webhooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "webhooks_insert_own"
  ON webhooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "webhooks_update_own"
  ON webhooks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "webhooks_delete_own"
  ON webhooks FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: webhook_deliveries
-- Purpose: Store webhook delivery logs and responses
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  
  -- Delivery information
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  attempt_number INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 3,
  
  -- Request/Response
  request_url TEXT NOT NULL,
  request_method TEXT DEFAULT 'POST',
  request_headers JSONB,
  request_body JSONB,
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,
  error_message TEXT,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS webhook_deliveries_webhook_id_idx ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS webhook_deliveries_session_id_idx ON webhook_deliveries(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS webhook_deliveries_status_idx ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS webhook_deliveries_started_at_idx ON webhook_deliveries(started_at DESC);

-- Function to update webhook delivery statistics
CREATE OR REPLACE FUNCTION update_webhook_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'success' AND (OLD.status IS NULL OR OLD.status != 'success') THEN
    UPDATE webhooks
    SET 
      successful_deliveries = successful_deliveries + 1,
      total_deliveries = total_deliveries + 1,
      last_delivery_status = 'success',
      last_delivery_at = NEW.completed_at
    WHERE id = NEW.webhook_id;
  ELSIF NEW.status = 'failed' AND (OLD.status IS NULL OR OLD.status != 'failed') THEN
    UPDATE webhooks
    SET 
      failed_deliveries = failed_deliveries + 1,
      total_deliveries = total_deliveries + 1,
      last_delivery_status = 'failed',
      last_delivery_at = NEW.completed_at
    WHERE id = NEW.webhook_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update webhook stats
DROP TRIGGER IF EXISTS trigger_update_webhook_stats ON webhook_deliveries;
CREATE TRIGGER trigger_update_webhook_stats
  AFTER INSERT OR UPDATE ON webhook_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_stats();

-- Enable Row Level Security
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access webhook deliveries for their own webhooks
CREATE POLICY "webhook_deliveries_select_own"
  ON webhook_deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM webhooks
      WHERE webhooks.id = webhook_deliveries.webhook_id
      AND webhooks.user_id = auth.uid()
    )
  );

CREATE POLICY "webhook_deliveries_insert_system"
  ON webhook_deliveries FOR INSERT
  WITH CHECK (true); -- Allow system inserts for webhook deliveries

-- Documentation
COMMENT ON TABLE webhooks IS 'Stores webhook configurations per agent';
COMMENT ON TABLE webhook_deliveries IS 'Stores webhook delivery logs and responses';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS webhook_deliveries CASCADE;
-- DROP TABLE IF EXISTS webhooks CASCADE;
