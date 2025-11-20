-- =====================================================
-- Migration: Create Agents Table
-- Created: 2025-11-21T00:34:10Z
-- Tables: agents
-- Purpose: Store agent configurations including schema, persona, knowledge, visuals, and publish settings
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
-- TABLE: agents
-- Purpose: Store agent configurations and metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Agent configuration (stored as JSONB for flexibility)
  schema JSONB NOT NULL DEFAULT '{"fields": []}'::jsonb,
  persona JSONB NOT NULL DEFAULT '{"name": "", "description": "", "tone": "friendly"}'::jsonb,
  knowledge JSONB,
  visuals JSONB NOT NULL DEFAULT '{"primaryColor": "#4F46E5", "welcomeMessage": ""}'::jsonb,
  publish JSONB NOT NULL DEFAULT '{"slug": "", "publicUrl": "", "emailOTPEnabled": false}'::jsonb,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}'::text[],
  sessions_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT agents_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT agents_slug_unique UNIQUE ((publish->>'slug'))
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS agents_user_id_idx ON agents(user_id);
CREATE INDEX IF NOT EXISTS agents_status_idx ON agents(status) WHERE status != 'archived';
CREATE INDEX IF NOT EXISTS agents_created_at_idx ON agents(created_at DESC);
CREATE INDEX IF NOT EXISTS agents_last_activity_at_idx ON agents(last_activity_at DESC) WHERE last_activity_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS agents_tags_idx ON agents USING GIN(tags);
CREATE INDEX IF NOT EXISTS agents_slug_idx ON agents((publish->>'slug')) WHERE publish->>'slug' IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_activity_at when sessions are created
CREATE OR REPLACE FUNCTION update_agent_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agents
  SET last_activity_at = NOW()
  WHERE id = NEW.agent_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own agents
CREATE POLICY "agents_select_own"
  ON agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "agents_insert_own"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agents_update_own"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agents_delete_own"
  ON agents FOR DELETE
  USING (auth.uid() = user_id);

-- Public read policy for published agents (for public agent sessions)
CREATE POLICY "agents_select_published"
  ON agents FOR SELECT
  USING (status = 'published');

-- Documentation
COMMENT ON TABLE agents IS 'Stores agent configurations including schema, persona, knowledge, visuals, and publish settings';
COMMENT ON COLUMN agents.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN agents.user_id IS 'Owner of this agent (references auth.users)';
COMMENT ON COLUMN agents.schema IS 'JSONB field containing agent schema with fields array';
COMMENT ON COLUMN agents.persona IS 'JSONB field containing persona configuration (name, description, tone, sampleMessages)';
COMMENT ON COLUMN agents.knowledge IS 'JSONB field containing knowledge base configuration (content, enableRAG, maxContextTokens, citationFlag)';
COMMENT ON COLUMN agents.visuals IS 'JSONB field containing visual branding (primaryColor, avatarUrl, logoUrl, welcomeMessage, customCSS)';
COMMENT ON COLUMN agents.publish IS 'JSONB field containing publish settings (slug, publicUrl, emailOTPEnabled, webhookUrl, webhookSecret, retentionDays)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS agents CASCADE;
