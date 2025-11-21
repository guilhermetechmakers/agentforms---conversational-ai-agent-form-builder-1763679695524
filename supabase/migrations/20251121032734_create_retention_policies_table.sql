-- =====================================================
-- Migration: Create Retention Policies Table
-- Created: 2025-11-21T03:27:34Z
-- Tables: retention_policies
-- Purpose: Store data retention policies for GDPR/CCPA compliance
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
-- TABLE: retention_policies
-- Purpose: Configure data retention and auto-deletion policies
-- =====================================================
CREATE TABLE IF NOT EXISTS retention_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Policy configuration
  name TEXT NOT NULL,
  description TEXT,
  data_type TEXT NOT NULL CHECK (data_type IN (
    'sessions',
    'messages',
    'extracted_fields',
    'agent_data',
    'user_data',
    'audit_logs',
    'all'
  )),
  retention_period_days INTEGER NOT NULL CHECK (retention_period_days > 0),
  
  -- Policy status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),
  auto_delete_enabled BOOLEAN DEFAULT true,
  notify_before_days INTEGER DEFAULT 7 CHECK (notify_before_days >= 0),
  
  -- Scope (optional agent_id for agent-specific policies)
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_executed_at TIMESTAMPTZ,
  next_execution_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT retention_policies_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT retention_policies_unique_user_name UNIQUE (user_id, name)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS retention_policies_user_id_idx ON retention_policies(user_id);
CREATE INDEX IF NOT EXISTS retention_policies_agent_id_idx ON retention_policies(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS retention_policies_status_idx ON retention_policies(status) WHERE status != 'deleted';
CREATE INDEX IF NOT EXISTS retention_policies_next_execution_idx ON retention_policies(next_execution_at) WHERE status = 'active' AND auto_delete_enabled = true;
CREATE INDEX IF NOT EXISTS retention_policies_data_type_idx ON retention_policies(data_type);
CREATE INDEX IF NOT EXISTS retention_policies_created_at_idx ON retention_policies(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_retention_policies_updated_at ON retention_policies;
CREATE TRIGGER update_retention_policies_updated_at
  BEFORE UPDATE ON retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own retention policies
CREATE POLICY "retention_policies_select_own"
  ON retention_policies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "retention_policies_insert_own"
  ON retention_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "retention_policies_update_own"
  ON retention_policies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "retention_policies_delete_own"
  ON retention_policies FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE retention_policies IS 'Data retention policies for GDPR/CCPA compliance';
COMMENT ON COLUMN retention_policies.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN retention_policies.user_id IS 'Owner of this policy (references auth.users)';
COMMENT ON COLUMN retention_policies.data_type IS 'Type of data this policy applies to';
COMMENT ON COLUMN retention_policies.retention_period_days IS 'Number of days to retain data before deletion';
COMMENT ON COLUMN retention_policies.auto_delete_enabled IS 'Whether automatic deletion is enabled';
COMMENT ON COLUMN retention_policies.notify_before_days IS 'Days before deletion to send notification';
COMMENT ON COLUMN retention_policies.agent_id IS 'Optional: specific agent this policy applies to';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS retention_policies CASCADE;
