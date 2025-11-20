-- =====================================================
-- Migration: Create User Profiles Table
-- Created: 2025-11-21T00:19:09Z
-- Tables: profiles
-- Purpose: Extend Supabase auth.users with additional profile information
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
-- TABLE: profiles
-- Purpose: Extended user profile information linked to auth.users
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Core profile fields
  name TEXT NOT NULL,
  company TEXT,
  email_verified BOOLEAN DEFAULT FALSE NOT NULL,
  
  -- OAuth provider information (stored as JSONB for flexibility)
  oauth_providers JSONB DEFAULT '[]'::jsonb,
  
  -- Enterprise/SSO information
  enterprise_id UUID,
  sso_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT profiles_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS profiles_email_verified_idx ON profiles(email_verified) WHERE email_verified = FALSE;
CREATE INDEX IF NOT EXISTS profiles_enterprise_id_idx ON profiles(enterprise_id) WHERE enterprise_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to manage all profiles (for admin operations)
CREATE POLICY "profiles_service_role_all"
  ON profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Documentation
COMMENT ON TABLE profiles IS 'Extended user profile information linked to Supabase auth.users';
COMMENT ON COLUMN profiles.id IS 'Primary key (references auth.users.id)';
COMMENT ON COLUMN profiles.name IS 'User full name';
COMMENT ON COLUMN profiles.company IS 'Optional company name';
COMMENT ON COLUMN profiles.email_verified IS 'Email verification status';
COMMENT ON COLUMN profiles.oauth_providers IS 'Array of OAuth providers linked to this account';
COMMENT ON COLUMN profiles.enterprise_id IS 'Enterprise organization ID for SSO users';
COMMENT ON COLUMN profiles.sso_enabled IS 'Whether SSO is enabled for this user';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP TABLE IF EXISTS profiles CASCADE;
