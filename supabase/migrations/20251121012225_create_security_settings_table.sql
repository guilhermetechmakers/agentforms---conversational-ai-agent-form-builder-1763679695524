-- =====================================================
-- Migration: Create Security Settings Table
-- Created: 2025-11-21T01:22:25Z
-- Tables: security_settings
-- Purpose: Store user security settings (2FA, SSO, etc.)
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
-- TABLE: security_settings
-- Purpose: Store user security configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS security_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Two-Factor Authentication
  two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  two_factor_secret TEXT, -- Encrypted TOTP secret
  two_factor_backup_codes TEXT[], -- Array of backup codes (hashed)
  two_factor_verified_at TIMESTAMPTZ,
  
  -- Single Sign-On
  sso_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  sso_type TEXT CHECK (sso_type IN ('saml', 'oauth', 'oidc')),
  sso_provider TEXT, -- e.g., 'google', 'microsoft', 'okta'
  sso_provider_id TEXT, -- External SSO provider user ID
  sso_metadata JSONB DEFAULT '{}'::jsonb, -- Additional SSO configuration
  
  -- Security preferences
  require_password_change BOOLEAN DEFAULT FALSE NOT NULL,
  last_password_change_at TIMESTAMPTZ,
  password_expires_at TIMESTAMPTZ,
  
  -- Session management
  max_active_sessions INTEGER DEFAULT 10 NOT NULL,
  session_timeout_minutes INTEGER DEFAULT 60 NOT NULL,
  
  -- Security metadata
  security_metadata JSONB DEFAULT '{}'::jsonb, -- Additional security settings
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT security_settings_user_id_unique UNIQUE (user_id),
  CONSTRAINT security_settings_two_factor_secret_check CHECK (
    (two_factor_enabled = FALSE) OR (two_factor_secret IS NOT NULL)
  ),
  CONSTRAINT security_settings_sso_type_check CHECK (
    (sso_enabled = FALSE) OR (sso_type IS NOT NULL)
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS security_settings_user_id_idx ON security_settings(user_id);
CREATE INDEX IF NOT EXISTS security_settings_two_factor_enabled_idx ON security_settings(two_factor_enabled) WHERE two_factor_enabled = TRUE;
CREATE INDEX IF NOT EXISTS security_settings_sso_enabled_idx ON security_settings(sso_enabled) WHERE sso_enabled = TRUE;
CREATE INDEX IF NOT EXISTS security_settings_created_at_idx ON security_settings(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_security_settings_updated_at ON security_settings;
CREATE TRIGGER update_security_settings_updated_at
  BEFORE UPDATE ON security_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own security settings
CREATE POLICY "security_settings_select_own"
  ON security_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "security_settings_insert_own"
  ON security_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "security_settings_update_own"
  ON security_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE security_settings IS 'User security settings including 2FA and SSO configuration';
COMMENT ON COLUMN security_settings.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN security_settings.user_id IS 'Owner of these security settings (references auth.users)';
COMMENT ON COLUMN security_settings.two_factor_enabled IS 'Whether two-factor authentication is enabled';
COMMENT ON COLUMN security_settings.two_factor_secret IS 'Encrypted TOTP secret for 2FA';
COMMENT ON COLUMN security_settings.sso_enabled IS 'Whether single sign-on is enabled';
COMMENT ON COLUMN security_settings.sso_type IS 'Type of SSO: saml, oauth, or oidc';
COMMENT ON COLUMN security_settings.sso_provider IS 'SSO provider name (e.g., google, microsoft, okta)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS security_settings CASCADE;
