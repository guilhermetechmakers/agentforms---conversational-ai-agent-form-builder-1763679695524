-- =====================================================
-- Migration: Create Schema Builder Tables
-- Created: 2025-11-21T02:21:09Z
-- Tables: agent_schemas, schema_fields, validation_rules, schema_drafts
-- Purpose: Support advanced schema builder features including versioning, drafts, validation rules, and conflict detection
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
-- TABLE: agent_schemas
-- Purpose: Store agent schema versions with metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_schemas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN DEFAULT false NOT NULL,
  is_locked BOOLEAN DEFAULT false NOT NULL,
  
  -- Schema metadata
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT agent_schemas_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT agent_schemas_version_positive CHECK (version > 0),
  CONSTRAINT agent_schemas_unique_version UNIQUE (agent_id, version)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS agent_schemas_agent_id_idx ON agent_schemas(agent_id);
CREATE INDEX IF NOT EXISTS agent_schemas_user_id_idx ON agent_schemas(user_id);
CREATE INDEX IF NOT EXISTS agent_schemas_created_at_idx ON agent_schemas(created_at DESC);
CREATE INDEX IF NOT EXISTS agent_schemas_version_idx ON agent_schemas(agent_id, version DESC);
CREATE INDEX IF NOT EXISTS agent_schemas_published_idx ON agent_schemas(agent_id, is_published) WHERE is_published = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_agent_schemas_updated_at ON agent_schemas;
CREATE TRIGGER update_agent_schemas_updated_at
  BEFORE UPDATE ON agent_schemas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: schema_fields
-- Purpose: Store individual fields for agent schemas
-- =====================================================
CREATE TABLE IF NOT EXISTS schema_fields (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  schema_id UUID REFERENCES agent_schemas(id) ON DELETE CASCADE NOT NULL,
  
  -- Core field properties
  field_id TEXT NOT NULL, -- Unique identifier within schema
  label TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'number', 'email', 'select', 'date', 'file')),
  required BOOLEAN DEFAULT false NOT NULL,
  order_index INTEGER NOT NULL,
  
  -- Field configuration
  placeholder TEXT,
  help_text TEXT,
  options JSONB, -- For select fields: array of strings
  pii_flag BOOLEAN DEFAULT false NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT schema_fields_label_not_empty CHECK (length(trim(label)) > 0),
  CONSTRAINT schema_fields_order_positive CHECK (order_index >= 0),
  CONSTRAINT schema_fields_unique_id UNIQUE (schema_id, field_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS schema_fields_schema_id_idx ON schema_fields(schema_id);
CREATE INDEX IF NOT EXISTS schema_fields_order_idx ON schema_fields(schema_id, order_index);
CREATE INDEX IF NOT EXISTS schema_fields_type_idx ON schema_fields(type);
CREATE INDEX IF NOT EXISTS schema_fields_pii_idx ON schema_fields(schema_id, pii_flag) WHERE pii_flag = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_schema_fields_updated_at ON schema_fields;
CREATE TRIGGER update_schema_fields_updated_at
  BEFORE UPDATE ON schema_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: validation_rules
-- Purpose: Store validation rules for schema fields
-- =====================================================
CREATE TABLE IF NOT EXISTS validation_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  field_id UUID REFERENCES schema_fields(id) ON DELETE CASCADE NOT NULL,
  
  -- Rule configuration
  rule_type TEXT NOT NULL CHECK (rule_type IN ('min', 'max', 'pattern', 'custom', 'email', 'url', 'phone')),
  parameters JSONB DEFAULT '{}'::jsonb, -- Flexible parameters for different rule types
  
  -- Rule metadata
  error_message TEXT,
  enabled BOOLEAN DEFAULT true NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT validation_rules_type_valid CHECK (rule_type IN ('min', 'max', 'pattern', 'custom', 'email', 'url', 'phone'))
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS validation_rules_field_id_idx ON validation_rules(field_id);
CREATE INDEX IF NOT EXISTS validation_rules_type_idx ON validation_rules(rule_type);
CREATE INDEX IF NOT EXISTS validation_rules_enabled_idx ON validation_rules(field_id, enabled) WHERE enabled = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_validation_rules_updated_at ON validation_rules;
CREATE TRIGGER update_validation_rules_updated_at
  BEFORE UPDATE ON validation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: schema_drafts
-- Purpose: Store autosaved drafts of schema edits
-- =====================================================
CREATE TABLE IF NOT EXISTS schema_drafts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  schema_id UUID REFERENCES agent_schemas(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Draft content (stores full schema state as JSONB)
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Draft metadata
  last_edited_by UUID REFERENCES auth.users(id),
  conflict_detected BOOLEAN DEFAULT false NOT NULL,
  conflict_resolved BOOLEAN DEFAULT false NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ, -- Optional expiration for old drafts
  
  -- Constraints
  CONSTRAINT schema_drafts_content_not_empty CHECK (content::text != '{}'::text)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS schema_drafts_schema_id_idx ON schema_drafts(schema_id);
CREATE INDEX IF NOT EXISTS schema_drafts_agent_id_idx ON schema_drafts(agent_id);
CREATE INDEX IF NOT EXISTS schema_drafts_user_id_idx ON schema_drafts(user_id);
CREATE INDEX IF NOT EXISTS schema_drafts_updated_at_idx ON schema_drafts(updated_at DESC);
CREATE INDEX IF NOT EXISTS schema_drafts_conflict_idx ON schema_drafts(schema_id, conflict_detected) WHERE conflict_detected = true;
CREATE INDEX IF NOT EXISTS schema_drafts_expires_idx ON schema_drafts(expires_at) WHERE expires_at IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_schema_drafts_updated_at ON schema_drafts;
CREATE TRIGGER update_schema_drafts_updated_at
  BEFORE UPDATE ON schema_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to detect concurrent edits
CREATE OR REPLACE FUNCTION detect_schema_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if another user has edited the schema since this draft was created
  IF EXISTS (
    SELECT 1 FROM agent_schemas
    WHERE id = NEW.schema_id
    AND updated_at > NEW.created_at
    AND updated_at < NOW()
  ) THEN
    NEW.conflict_detected = true;
    NEW.conflict_resolved = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to detect conflicts on draft updates
DROP TRIGGER IF EXISTS check_schema_conflicts ON schema_drafts;
CREATE TRIGGER check_schema_conflicts
  BEFORE UPDATE ON schema_drafts
  FOR EACH ROW
  EXECUTE FUNCTION detect_schema_conflicts();

-- Enable Row Level Security
ALTER TABLE agent_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_schemas
CREATE POLICY "agent_schemas_select_own"
  ON agent_schemas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "agent_schemas_insert_own"
  ON agent_schemas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_schemas_update_own"
  ON agent_schemas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_schemas_delete_own"
  ON agent_schemas FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for schema_fields (via schema ownership)
CREATE POLICY "schema_fields_select_own"
  ON schema_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agent_schemas
      WHERE agent_schemas.id = schema_fields.schema_id
      AND agent_schemas.user_id = auth.uid()
    )
  );

CREATE POLICY "schema_fields_insert_own"
  ON schema_fields FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agent_schemas
      WHERE agent_schemas.id = schema_fields.schema_id
      AND agent_schemas.user_id = auth.uid()
    )
  );

CREATE POLICY "schema_fields_update_own"
  ON schema_fields FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agent_schemas
      WHERE agent_schemas.id = schema_fields.schema_id
      AND agent_schemas.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agent_schemas
      WHERE agent_schemas.id = schema_fields.schema_id
      AND agent_schemas.user_id = auth.uid()
    )
  );

CREATE POLICY "schema_fields_delete_own"
  ON schema_fields FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM agent_schemas
      WHERE agent_schemas.id = schema_fields.schema_id
      AND agent_schemas.user_id = auth.uid()
    )
  );

-- RLS Policies for validation_rules (via field ownership)
CREATE POLICY "validation_rules_select_own"
  ON validation_rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schema_fields
      JOIN agent_schemas ON agent_schemas.id = schema_fields.schema_id
      WHERE schema_fields.id = validation_rules.field_id
      AND agent_schemas.user_id = auth.uid()
    )
  );

CREATE POLICY "validation_rules_insert_own"
  ON validation_rules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM schema_fields
      JOIN agent_schemas ON agent_schemas.id = schema_fields.schema_id
      WHERE schema_fields.id = validation_rules.field_id
      AND agent_schemas.user_id = auth.uid()
    )
  );

CREATE POLICY "validation_rules_update_own"
  ON validation_rules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM schema_fields
      JOIN agent_schemas ON agent_schemas.id = schema_fields.schema_id
      WHERE schema_fields.id = validation_rules.field_id
      AND agent_schemas.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM schema_fields
      JOIN agent_schemas ON agent_schemas.id = schema_fields.schema_id
      WHERE schema_fields.id = validation_rules.field_id
      AND agent_schemas.user_id = auth.uid()
    )
  );

CREATE POLICY "validation_rules_delete_own"
  ON validation_rules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM schema_fields
      JOIN agent_schemas ON agent_schemas.id = schema_fields.schema_id
      WHERE schema_fields.id = validation_rules.field_id
      AND agent_schemas.user_id = auth.uid()
    )
  );

-- RLS Policies for schema_drafts
CREATE POLICY "schema_drafts_select_own"
  ON schema_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "schema_drafts_insert_own"
  ON schema_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "schema_drafts_update_own"
  ON schema_drafts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "schema_drafts_delete_own"
  ON schema_drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE agent_schemas IS 'Stores agent schema versions with metadata for version management';
COMMENT ON TABLE schema_fields IS 'Stores individual fields for agent schemas with ordering and configuration';
COMMENT ON TABLE validation_rules IS 'Stores validation rules for schema fields with flexible parameters';
COMMENT ON TABLE schema_drafts IS 'Stores autosaved drafts of schema edits with conflict detection';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS schema_drafts CASCADE;
-- DROP TABLE IF EXISTS validation_rules CASCADE;
-- DROP TABLE IF EXISTS schema_fields CASCADE;
-- DROP TABLE IF EXISTS agent_schemas CASCADE;
-- DROP FUNCTION IF EXISTS detect_schema_conflicts() CASCADE;
