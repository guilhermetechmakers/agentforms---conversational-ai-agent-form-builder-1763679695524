-- =====================================================
-- Migration: Create Access Controls Table
-- Created: 2025-11-21T03:27:35Z
-- Tables: access_controls
-- Purpose: Manage access permissions for sessions and data exports
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
-- TABLE: access_controls
-- Purpose: Control access to sessions, data exports, and sensitive operations
-- =====================================================
CREATE TABLE IF NOT EXISTS access_controls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Control configuration
  name TEXT NOT NULL,
  description TEXT,
  
  -- Resource being controlled
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'session',
    'agent',
    'export',
    'webhook',
    'settings',
    'billing',
    'team',
    'all'
  )),
  resource_id UUID, -- Optional: specific resource (session_id, agent_id, etc.)
  
  -- Permission level
  permission_level TEXT NOT NULL CHECK (permission_level IN (
    'read',
    'write',
    'delete',
    'admin',
    'none'
  )),
  
  -- Scope (user-specific or role-based)
  scope_type TEXT NOT NULL CHECK (scope_type IN ('user', 'role', 'team')),
  scope_id UUID, -- user_id, role name, or team_id depending on scope_type
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  expires_at TIMESTAMPTZ, -- Optional expiration
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT access_controls_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS access_controls_user_id_idx ON access_controls(user_id);
CREATE INDEX IF NOT EXISTS access_controls_resource_type_idx ON access_controls(resource_type);
CREATE INDEX IF NOT EXISTS access_controls_resource_id_idx ON access_controls(resource_id) WHERE resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS access_controls_scope_type_idx ON access_controls(scope_type);
CREATE INDEX IF NOT EXISTS access_controls_scope_id_idx ON access_controls(scope_id) WHERE scope_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS access_controls_status_idx ON access_controls(status) WHERE status != 'revoked';
CREATE INDEX IF NOT EXISTS access_controls_expires_at_idx ON access_controls(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS access_controls_created_at_idx ON access_controls(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS access_controls_resource_lookup_idx ON access_controls(resource_type, resource_id, status) WHERE resource_id IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_access_controls_updated_at ON access_controls;
CREATE TRIGGER update_access_controls_updated_at
  BEFORE UPDATE ON access_controls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE access_controls ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own access controls
CREATE POLICY "access_controls_select_own"
  ON access_controls FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "access_controls_insert_own"
  ON access_controls FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "access_controls_update_own"
  ON access_controls FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "access_controls_delete_own"
  ON access_controls FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE access_controls IS 'Access control permissions for sessions, exports, and sensitive operations';
COMMENT ON COLUMN access_controls.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN access_controls.user_id IS 'Owner/creator of this access control (references auth.users)';
COMMENT ON COLUMN access_controls.resource_type IS 'Type of resource being controlled';
COMMENT ON COLUMN access_controls.resource_id IS 'Optional: specific resource ID';
COMMENT ON COLUMN access_controls.permission_level IS 'Permission level granted';
COMMENT ON COLUMN access_controls.scope_type IS 'Whether control applies to user, role, or team';
COMMENT ON COLUMN access_controls.scope_id IS 'ID of user, role, or team this applies to';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS access_controls CASCADE;
