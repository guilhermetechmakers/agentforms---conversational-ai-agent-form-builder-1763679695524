-- =====================================================
-- Migration: Create Audit Logs Table
-- Created: 2025-11-21T03:07:45Z
-- Tables: audit_logs
-- Purpose: Track changes in roles, billing, and other critical actions for compliance
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
-- TABLE: audit_logs
-- Purpose: Store audit trail for compliance and tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL, -- References the organization owner's user_id
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who performed the action
  action_type TEXT NOT NULL CHECK (action_type IN (
    'team_member_invited',
    'team_member_role_changed',
    'team_member_removed',
    'team_member_accepted',
    'team_member_declined',
    'seat_added',
    'seat_removed',
    'subscription_changed',
    'billing_updated',
    'permission_changed',
    'settings_updated'
  )),
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'team_member',
    'subscription',
    'billing',
    'settings',
    'permission'
  )),
  entity_id UUID, -- ID of the affected entity (team_member, subscription, etc.)
  old_value JSONB, -- Previous state (e.g., old role, old seat count)
  new_value JSONB, -- New state (e.g., new role, new seat count)
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional context (IP address, user agent, etc.)
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT audit_logs_action_type_not_empty CHECK (length(trim(action_type)) > 0),
  CONSTRAINT audit_logs_entity_type_not_empty CHECK (length(trim(entity_type)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS audit_logs_organization_id_idx ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_action_type_idx ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS audit_logs_entity_type_idx ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS audit_logs_entity_id_idx ON audit_logs(entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_organization_created_idx ON audit_logs(organization_id, created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_audit_logs_updated_at ON audit_logs;
CREATE TRIGGER update_audit_logs_updated_at
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view audit logs for their organization
CREATE POLICY "audit_logs_select_own_org"
  ON audit_logs FOR SELECT
  USING (
    auth.uid() = organization_id OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.organization_id = audit_logs.organization_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'member')
    )
  );

-- RLS Policies: Only system can insert audit logs (via triggers or backend)
-- Note: In production, this should be handled by backend functions/triggers
-- For now, we allow admins to insert for testing purposes
CREATE POLICY "audit_logs_insert_admin"
  ON audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() = organization_id OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.organization_id = audit_logs.organization_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- Documentation
COMMENT ON TABLE audit_logs IS 'Audit trail for compliance and tracking critical actions';
COMMENT ON COLUMN audit_logs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN audit_logs.organization_id IS 'Organization owner user_id';
COMMENT ON COLUMN audit_logs.user_id IS 'User who performed the action';
COMMENT ON COLUMN audit_logs.action_type IS 'Type of action performed';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN audit_logs.old_value IS 'Previous state (JSON)';
COMMENT ON COLUMN audit_logs.new_value IS 'New state (JSON)';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context and metadata';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS audit_logs CASCADE;
