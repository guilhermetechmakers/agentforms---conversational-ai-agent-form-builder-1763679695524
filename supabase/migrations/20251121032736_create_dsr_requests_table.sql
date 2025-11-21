-- =====================================================
-- Migration: Create DSR Requests Table
-- Created: 2025-11-21T03:27:36Z
-- Tables: dsr_requests
-- Purpose: Handle Data Subject Requests (GDPR/CCPA) for data export and deletion
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
-- TABLE: dsr_requests
-- Purpose: Track and process Data Subject Requests (GDPR Article 15, 17, 20)
-- =====================================================
CREATE TABLE IF NOT EXISTS dsr_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Request details
  request_type TEXT NOT NULL CHECK (request_type IN (
    'export',      -- Right to access (GDPR Article 15)
    'deletion',    -- Right to erasure (GDPR Article 17)
    'portability', -- Right to data portability (GDPR Article 20)
    'rectification' -- Right to rectification (GDPR Article 16)
  )),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'rejected',
    'cancelled'
  )),
  
  -- Request metadata
  description TEXT,
  requested_data_types TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['sessions', 'messages', 'profile', etc.]
  
  -- Processing details
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Admin who processed
  processed_at TIMESTAMPTZ,
  processing_notes TEXT,
  
  -- Export/deletion details
  export_file_url TEXT, -- URL to exported data file (for export/portability requests)
  export_file_expires_at TIMESTAMPTZ, -- When export file expires
  deleted_records_count INTEGER DEFAULT 0, -- For deletion requests
  deleted_data_types TEXT[] DEFAULT ARRAY[]::TEXT[], -- What was deleted
  
  -- Verification
  verification_token TEXT, -- Token to verify request authenticity
  verification_method TEXT CHECK (verification_method IN ('email', 'id_verification', 'manual')),
  verified_at TIMESTAMPTZ,
  
  -- Compliance tracking
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  due_date TIMESTAMPTZ, -- Regulatory deadline (typically 30 days for GDPR)
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT dsr_requests_due_date_after_submitted CHECK (due_date IS NULL OR due_date >= submitted_at)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS dsr_requests_user_id_idx ON dsr_requests(user_id);
CREATE INDEX IF NOT EXISTS dsr_requests_status_idx ON dsr_requests(status);
CREATE INDEX IF NOT EXISTS dsr_requests_request_type_idx ON dsr_requests(request_type);
CREATE INDEX IF NOT EXISTS dsr_requests_processed_by_idx ON dsr_requests(processed_by) WHERE processed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS dsr_requests_submitted_at_idx ON dsr_requests(submitted_at DESC);
CREATE INDEX IF NOT EXISTS dsr_requests_due_date_idx ON dsr_requests(due_date) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS dsr_requests_verification_token_idx ON dsr_requests(verification_token) WHERE verification_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS dsr_requests_created_at_idx ON dsr_requests(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_dsr_requests_updated_at ON dsr_requests;
CREATE TRIGGER update_dsr_requests_updated_at
  BEFORE UPDATE ON dsr_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE dsr_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own DSR requests
CREATE POLICY "dsr_requests_select_own"
  ON dsr_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "dsr_requests_insert_own"
  ON dsr_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "dsr_requests_update_own"
  ON dsr_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all DSR requests (for processing)
-- Note: This requires checking team_members table for admin role
CREATE POLICY "dsr_requests_select_admin"
  ON dsr_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
  );

-- Documentation
COMMENT ON TABLE dsr_requests IS 'Data Subject Requests for GDPR/CCPA compliance (export, deletion, portability, rectification)';
COMMENT ON COLUMN dsr_requests.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN dsr_requests.user_id IS 'User who submitted the request (references auth.users)';
COMMENT ON COLUMN dsr_requests.request_type IS 'Type of DSR request';
COMMENT ON COLUMN dsr_requests.status IS 'Current status of the request';
COMMENT ON COLUMN dsr_requests.due_date IS 'Regulatory deadline (typically 30 days from submission)';
COMMENT ON COLUMN dsr_requests.export_file_url IS 'URL to exported data file (for export/portability requests)';
COMMENT ON COLUMN dsr_requests.verification_token IS 'Token to verify request authenticity';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS dsr_requests CASCADE;
