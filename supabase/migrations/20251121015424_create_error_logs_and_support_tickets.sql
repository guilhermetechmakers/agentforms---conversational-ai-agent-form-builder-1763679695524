-- =====================================================
-- Migration: Create Error Logs and Support Tickets Tables
-- Created: 2025-11-21T01:54:24Z
-- Tables: error_logs, support_tickets
-- Purpose: Track application errors and manage support tickets
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
-- TABLE: error_logs
-- Purpose: Log application errors for debugging and monitoring
-- =====================================================
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Error details
  error_type TEXT NOT NULL CHECK (error_type IN ('404', '500', '400', '403', 'network', 'validation', 'other')),
  url_attempted TEXT NOT NULL,
  http_method TEXT,
  status_code INTEGER,
  
  -- Error information
  error_message TEXT,
  stack_trace TEXT,
  user_agent TEXT,
  ip_address INET,
  
  -- Support ticket reference (if created)
  support_ticket_id UUID,
  
  -- Additional metadata
  additional_info JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT error_logs_url_not_empty CHECK (length(trim(url_attempted)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS error_logs_user_id_idx ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS error_logs_error_type_idx ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS error_logs_created_at_idx ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS error_logs_support_ticket_id_idx ON error_logs(support_ticket_id);
CREATE INDEX IF NOT EXISTS error_logs_status_code_idx ON error_logs(status_code) WHERE status_code IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_error_logs_updated_at ON error_logs;
CREATE TRIGGER update_error_logs_updated_at
  BEFORE UPDATE ON error_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own error logs, admins can see all
CREATE POLICY "error_logs_select_own"
  ON error_logs FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "error_logs_insert_own"
  ON error_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow system to insert error logs without user_id (for public errors)
CREATE POLICY "error_logs_insert_public"
  ON error_logs FOR INSERT
  WITH CHECK (user_id IS NULL);

-- Documentation
COMMENT ON TABLE error_logs IS 'Application error logs for debugging and monitoring';
COMMENT ON COLUMN error_logs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN error_logs.user_id IS 'User who encountered the error (nullable for public errors)';
COMMENT ON COLUMN error_logs.error_type IS 'Type of error (404, 500, 400, 403, network, validation, other)';
COMMENT ON COLUMN error_logs.url_attempted IS 'URL that caused the error';
COMMENT ON COLUMN error_logs.support_ticket_id IS 'Reference to support ticket if one was created';

-- =====================================================
-- TABLE: support_tickets
-- Purpose: Manage support tickets created from error pages
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Ticket details
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Ticket status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Related information
  error_log_id UUID REFERENCES error_logs(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  
  -- Attachments and metadata
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of file URLs or references
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Admin notes (internal)
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT support_tickets_subject_not_empty CHECK (length(trim(subject)) > 0),
  CONSTRAINT support_tickets_description_not_empty CHECK (length(trim(description)) > 0),
  CONSTRAINT support_tickets_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_priority_idx ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS support_tickets_created_at_idx ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS support_tickets_error_log_id_idx ON support_tickets(error_log_id);
CREATE INDEX IF NOT EXISTS support_tickets_assigned_to_idx ON support_tickets(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS support_tickets_email_idx ON support_tickets(email);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set resolved_at when status changes to resolved
CREATE OR REPLACE FUNCTION set_support_ticket_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
  ELSIF NEW.status != 'resolved' AND OLD.status = 'resolved' THEN
    NEW.resolved_at = NULL;
  END IF;
  
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = NOW();
  ELSIF NEW.status != 'closed' AND OLD.status = 'closed' THEN
    NEW.closed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_support_ticket_resolved_at_trigger ON support_tickets;
CREATE TRIGGER set_support_ticket_resolved_at_trigger
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_support_ticket_resolved_at();

-- Enable Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can access their own tickets, admins can see all
CREATE POLICY "support_tickets_select_own"
  ON support_tickets FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "support_tickets_insert_own"
  ON support_tickets FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    user_id IS NULL -- Allow public ticket creation
  );

CREATE POLICY "support_tickets_update_own"
  ON support_tickets FOR UPDATE
  USING (
    auth.uid() = user_id OR
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Documentation
COMMENT ON TABLE support_tickets IS 'Support tickets created from error pages or user requests';
COMMENT ON COLUMN support_tickets.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN support_tickets.user_id IS 'User who created the ticket (nullable for public tickets)';
COMMENT ON COLUMN support_tickets.status IS 'Current status of the ticket (open, in_progress, resolved, closed)';
COMMENT ON COLUMN support_tickets.priority IS 'Priority level (low, medium, high, urgent)';
COMMENT ON COLUMN support_tickets.error_log_id IS 'Reference to error log if ticket was created from an error';
COMMENT ON COLUMN support_tickets.assigned_to IS 'Admin user assigned to handle this ticket';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS support_tickets CASCADE;
-- DROP TABLE IF EXISTS error_logs CASCADE;
-- DROP FUNCTION IF EXISTS set_support_ticket_resolved_at() CASCADE;
