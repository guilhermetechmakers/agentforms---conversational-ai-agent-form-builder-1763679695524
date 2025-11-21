-- =====================================================
-- Migration: Create Exports Table
-- Created: 2025-11-21T02:51:00Z
-- Tables: exports
-- Purpose: Store export history for session data exports
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
-- TABLE: exports
-- Purpose: Track export history for session data
-- =====================================================
CREATE TABLE IF NOT EXISTS exports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Export configuration
  format TEXT NOT NULL CHECK (format IN ('json', 'csv')),
  session_ids UUID[] NOT NULL, -- Array of session IDs included in export
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  
  -- Export status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- File information
  file_path TEXT, -- Path to generated file (if stored)
  file_size_bytes INTEGER, -- Size of exported file in bytes
  file_url TEXT, -- URL to download the file (if available)
  
  -- Export metadata
  filters JSONB DEFAULT '{}'::jsonb, -- Filters applied to export
  total_sessions INTEGER DEFAULT 0, -- Total number of sessions exported
  
  -- Error information
  error_message TEXT,
  error_details JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT exports_format_not_empty CHECK (length(trim(format)) > 0),
  CONSTRAINT exports_session_ids_not_empty CHECK (array_length(session_ids, 1) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS exports_user_id_idx ON exports(user_id);
CREATE INDEX IF NOT EXISTS exports_agent_id_idx ON exports(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS exports_status_idx ON exports(status);
CREATE INDEX IF NOT EXISTS exports_created_at_idx ON exports(created_at DESC);
CREATE INDEX IF NOT EXISTS exports_format_idx ON exports(format);

-- GIN index for session_ids array searches
CREATE INDEX IF NOT EXISTS exports_session_ids_idx ON exports USING GIN(session_ids);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_exports_updated_at ON exports;
CREATE TRIGGER update_exports_updated_at
  BEFORE UPDATE ON exports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own exports
CREATE POLICY "exports_select_own"
  ON exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "exports_insert_own"
  ON exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exports_update_own"
  ON exports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exports_delete_own"
  ON exports FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE exports IS 'Stores export history for session data exports';
COMMENT ON COLUMN exports.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN exports.user_id IS 'Owner of this export (references auth.users)';
COMMENT ON COLUMN exports.format IS 'Export format: json or csv';
COMMENT ON COLUMN exports.session_ids IS 'Array of session IDs included in this export';
COMMENT ON COLUMN exports.status IS 'Export status: pending, processing, completed, failed';
COMMENT ON COLUMN exports.file_path IS 'Path to generated file (if stored on server)';
COMMENT ON COLUMN exports.file_url IS 'URL to download the file (if available)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS exports CASCADE;
