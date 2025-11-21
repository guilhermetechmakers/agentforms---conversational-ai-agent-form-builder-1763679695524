-- =====================================================
-- Migration: Create Knowledge Snippets Table
-- Created: 2025-11-21T02:33:49Z
-- Tables: knowledge_snippets
-- Purpose: Store individual knowledge snippets for agents with categories and tags for better organization
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
-- TABLE: knowledge_snippets
-- Purpose: Store individual knowledge snippets linked to agents
-- =====================================================
CREATE TABLE IF NOT EXISTS knowledge_snippets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  
  -- Ordering and organization
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT knowledge_snippets_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT knowledge_snippets_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS knowledge_snippets_agent_id_idx ON knowledge_snippets(agent_id);
CREATE INDEX IF NOT EXISTS knowledge_snippets_user_id_idx ON knowledge_snippets(user_id);
CREATE INDEX IF NOT EXISTS knowledge_snippets_category_idx ON knowledge_snippets(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS knowledge_snippets_tags_idx ON knowledge_snippets USING GIN(tags);
CREATE INDEX IF NOT EXISTS knowledge_snippets_created_at_idx ON knowledge_snippets(created_at DESC);
CREATE INDEX IF NOT EXISTS knowledge_snippets_display_order_idx ON knowledge_snippets(agent_id, display_order);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_knowledge_snippets_updated_at ON knowledge_snippets;
CREATE TRIGGER update_knowledge_snippets_updated_at
  BEFORE UPDATE ON knowledge_snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE knowledge_snippets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own knowledge snippets
CREATE POLICY "knowledge_snippets_select_own"
  ON knowledge_snippets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "knowledge_snippets_insert_own"
  ON knowledge_snippets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "knowledge_snippets_update_own"
  ON knowledge_snippets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "knowledge_snippets_delete_own"
  ON knowledge_snippets FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE knowledge_snippets IS 'Stores individual knowledge snippets for agents with categories and tags';
COMMENT ON COLUMN knowledge_snippets.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN knowledge_snippets.agent_id IS 'Agent this snippet belongs to (references agents)';
COMMENT ON COLUMN knowledge_snippets.user_id IS 'Owner of this snippet (references auth.users)';
COMMENT ON COLUMN knowledge_snippets.title IS 'Title/name of the knowledge snippet';
COMMENT ON COLUMN knowledge_snippets.content IS 'Content/text of the knowledge snippet';
COMMENT ON COLUMN knowledge_snippets.category IS 'Category for organizing snippets';
COMMENT ON COLUMN knowledge_snippets.tags IS 'Array of tags for filtering and organization';
COMMENT ON COLUMN knowledge_snippets.display_order IS 'Order for displaying snippets within an agent';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS knowledge_snippets CASCADE;
