-- =====================================================
-- Migration: Create General Validation Rules Table
-- Created: 2025-11-21T03:41:29Z
-- Tables: general_validation_rules
-- Purpose: Store validation rules for forms and components (separate from schema field validation)
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
-- TABLE: general_validation_rules
-- Purpose: Store validation rules for forms and components
-- =====================================================
CREATE TABLE IF NOT EXISTS general_validation_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rule identification
  rule_name TEXT NOT NULL,
  rule_description TEXT,
  form_component TEXT NOT NULL, -- e.g., 'signup_form', 'agent_builder', 'settings_form'
  field_name TEXT, -- Optional: specific field this rule applies to
  
  -- Validation criteria
  rule_type TEXT NOT NULL CHECK (rule_type IN ('required', 'min_length', 'max_length', 'pattern', 'email', 'url', 'phone', 'number', 'date', 'custom')),
  validation_criteria JSONB DEFAULT '{}'::jsonb, -- Flexible criteria storage (e.g., {"min": 8, "max": 50, "pattern": "^[A-Za-z0-9]+$"})
  error_message TEXT NOT NULL, -- User-friendly error message
  
  -- Rule configuration
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority rules are checked first
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT general_validation_rules_name_not_empty CHECK (length(trim(rule_name)) > 0),
  CONSTRAINT general_validation_rules_form_component_not_empty CHECK (length(trim(form_component)) > 0),
  CONSTRAINT general_validation_rules_error_message_not_empty CHECK (length(trim(error_message)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS general_validation_rules_user_id_idx ON general_validation_rules(user_id);
CREATE INDEX IF NOT EXISTS general_validation_rules_form_component_idx ON general_validation_rules(form_component);
CREATE INDEX IF NOT EXISTS general_validation_rules_field_name_idx ON general_validation_rules(field_name) WHERE field_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS general_validation_rules_enabled_idx ON general_validation_rules(form_component, enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS general_validation_rules_priority_idx ON general_validation_rules(form_component, priority DESC);
CREATE INDEX IF NOT EXISTS general_validation_rules_created_at_idx ON general_validation_rules(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_general_validation_rules_updated_at ON general_validation_rules;
CREATE TRIGGER update_general_validation_rules_updated_at
  BEFORE UPDATE ON general_validation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE general_validation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can manage their own rules, admins can see all
CREATE POLICY "general_validation_rules_select_own"
  ON general_validation_rules FOR SELECT
  USING (
    auth.uid() = user_id OR
    user_id IS NULL OR -- System-wide rules (no user_id)
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "general_validation_rules_insert_own"
  ON general_validation_rules FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "general_validation_rules_update_own"
  ON general_validation_rules FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "general_validation_rules_delete_own"
  ON general_validation_rules FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Documentation
COMMENT ON TABLE general_validation_rules IS 'Validation rules for forms and components (separate from schema field validation)';
COMMENT ON COLUMN general_validation_rules.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN general_validation_rules.user_id IS 'Owner of this rule (nullable for system-wide rules)';
COMMENT ON COLUMN general_validation_rules.rule_name IS 'Human-readable name for the rule';
COMMENT ON COLUMN general_validation_rules.form_component IS 'Form or component this rule applies to (e.g., signup_form, agent_builder)';
COMMENT ON COLUMN general_validation_rules.field_name IS 'Optional: specific field name this rule applies to';
COMMENT ON COLUMN general_validation_rules.rule_type IS 'Type of validation rule';
COMMENT ON COLUMN general_validation_rules.validation_criteria IS 'Flexible JSONB storage for validation parameters';
COMMENT ON COLUMN general_validation_rules.error_message IS 'User-friendly error message to display when validation fails';
COMMENT ON COLUMN general_validation_rules.priority IS 'Rule priority (higher numbers checked first)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS general_validation_rules CASCADE;
