-- =====================================================
-- Migration: Create Team Members Table
-- Created: 2025-11-21T01:22:23Z
-- Tables: team_members
-- Purpose: Manage team members and their roles within organizations
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
-- TABLE: team_members
-- Purpose: Store team member relationships and roles
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL, -- References the owner's user_id or a future organizations table
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL, -- Email of the invited member (before they accept)
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')) NOT NULL,
  invite_status TEXT DEFAULT 'pending' CHECK (invite_status IN ('pending', 'accepted', 'declined')) NOT NULL,
  invite_token TEXT UNIQUE, -- Token for accepting invitations
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT team_members_email_not_empty CHECK (length(trim(email)) > 0),
  CONSTRAINT team_members_unique_org_email UNIQUE (organization_id, email)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS team_members_organization_id_idx ON team_members(organization_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS team_members_email_idx ON team_members(email);
CREATE INDEX IF NOT EXISTS team_members_invite_token_idx ON team_members(invite_token) WHERE invite_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS team_members_invite_status_idx ON team_members(invite_status);
CREATE INDEX IF NOT EXISTS team_members_created_at_idx ON team_members(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can view team members in their organization
CREATE POLICY "team_members_select_own_org"
  ON team_members FOR SELECT
  USING (
    auth.uid() = organization_id OR
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.organization_id = team_members.organization_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'member')
    )
  );

-- RLS Policies: Only admins can insert team members
CREATE POLICY "team_members_insert_admin"
  ON team_members FOR INSERT
  WITH CHECK (
    auth.uid() = organization_id OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.organization_id = team_members.organization_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- RLS Policies: Only admins can update team members
CREATE POLICY "team_members_update_admin"
  ON team_members FOR UPDATE
  USING (
    auth.uid() = organization_id OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.organization_id = team_members.organization_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = organization_id OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.organization_id = team_members.organization_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- RLS Policies: Only admins can delete team members
CREATE POLICY "team_members_delete_admin"
  ON team_members FOR DELETE
  USING (
    auth.uid() = organization_id OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.organization_id = team_members.organization_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- Documentation
COMMENT ON TABLE team_members IS 'Team member relationships and roles within organizations';
COMMENT ON COLUMN team_members.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN team_members.organization_id IS 'Organization owner user_id';
COMMENT ON COLUMN team_members.user_id IS 'User ID after invitation is accepted (nullable until accepted)';
COMMENT ON COLUMN team_members.email IS 'Email address of the invited member';
COMMENT ON COLUMN team_members.role IS 'Role: admin, member, or viewer';
COMMENT ON COLUMN team_members.invite_status IS 'Status of the invitation: pending, accepted, or declined';
COMMENT ON COLUMN team_members.invite_token IS 'Unique token for accepting invitations';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS team_members CASCADE;
