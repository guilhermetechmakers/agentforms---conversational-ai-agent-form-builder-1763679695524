-- =====================================================
-- Migration: Create SSO Configurations Table
-- Created: 2025-11-21T02:00:00Z
-- Tables: sso_configurations
-- Purpose: Store SSO provider configurations for enterprise organizations
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
-- TABLE: sso_configurations
-- Purpose: Store SSO provider settings for organizations
-- =====================================================
CREATE TABLE IF NOT EXISTS sso_configurations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL, -- References the owner's user_id or a future organizations table
  
  -- SSO Provider Information
  provider TEXT NOT NULL CHECK (provider IN ('saml', 'oauth', 'azure', 'google_workspace', 'okta', 'onelogin')),
  provider_name TEXT NOT NULL, -- Display name for the provider
  
  -- SSO Settings (stored as JSONB for flexibility)
  -- SAML: entity_id, sso_url, x509_cert, attribute_mapping
  -- OAuth: client_id, client_secret, authorization_url, token_url, userinfo_url, scopes
  -- Azure: tenant_id, client_id, client_secret
  settings JSONB DEFAULT '{}'::jsonb NOT NULL,
  
  -- Configuration Status
  enabled BOOLEAN DEFAULT FALSE NOT NULL,
  verified BOOLEAN DEFAULT FALSE NOT NULL, -- Whether the configuration has been tested and verified
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional provider-specific metadata
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT sso_configurations_provider_name_not_empty CHECK (length(trim(provider_name)) > 0),
  CONSTRAINT sso_configurations_unique_org_provider UNIQUE (organization_id, provider)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS sso_configurations_organization_id_idx ON sso_configurations(organization_id);
CREATE INDEX IF NOT EXISTS sso_configurations_provider_idx ON sso_configurations(provider);
CREATE INDEX IF NOT EXISTS sso_configurations_enabled_idx ON sso_configurations(enabled) WHERE enabled = TRUE;
CREATE INDEX IF NOT EXISTS sso_configurations_verified_idx ON sso_configurations(verified) WHERE verified = TRUE;
CREATE INDEX IF NOT EXISTS sso_configurations_created_at_idx ON sso_configurations(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_sso_configurations_updated_at ON sso_configurations;
CREATE TRIGGER update_sso_configurations_updated_at
  BEFORE UPDATE ON sso_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE sso_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access SSO configs for their organization
-- Note: This assumes organization_id references user_id for now
-- In a full implementation, you'd have an organizations table with proper membership checks
CREATE POLICY "sso_configurations_select_own_org"
  ON sso_configurations FOR SELECT
  USING (auth.uid() = organization_id);

CREATE POLICY "sso_configurations_insert_own_org"
  ON sso_configurations FOR INSERT
  WITH CHECK (auth.uid() = organization_id);

CREATE POLICY "sso_configurations_update_own_org"
  ON sso_configurations FOR UPDATE
  USING (auth.uid() = organization_id)
  WITH CHECK (auth.uid() = organization_id);

CREATE POLICY "sso_configurations_delete_own_org"
  ON sso_configurations FOR DELETE
  USING (auth.uid() = organization_id);

-- Allow service role to manage all SSO configs (for admin operations)
CREATE POLICY "sso_configurations_service_role_all"
  ON sso_configurations FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Documentation
COMMENT ON TABLE sso_configurations IS 'SSO provider configurations for enterprise organizations';
COMMENT ON COLUMN sso_configurations.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN sso_configurations.organization_id IS 'Organization owner ID (references user_id for now)';
COMMENT ON COLUMN sso_configurations.provider IS 'SSO provider type (saml, oauth, azure, etc.)';
COMMENT ON COLUMN sso_configurations.provider_name IS 'Display name for the SSO provider';
COMMENT ON COLUMN sso_configurations.settings IS 'Provider-specific configuration (JSONB)';
COMMENT ON COLUMN sso_configurations.enabled IS 'Whether this SSO configuration is active';
COMMENT ON COLUMN sso_configurations.verified IS 'Whether the configuration has been tested and verified';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS sso_configurations CASCADE;
