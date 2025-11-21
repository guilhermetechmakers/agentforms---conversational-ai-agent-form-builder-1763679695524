-- =====================================================
-- Migration: Create Help Center Tables
-- Created: 2025-11-21T01:41:17Z
-- Tables: faqs, support_requests, help_center_interactions
-- Purpose: Support help center functionality with FAQs, support tickets, and analytics
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search (idempotent)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: faqs
-- Purpose: Store frequently asked questions with categories and helpfulness tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Core fields
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'getting-started', 'agents', 'sessions', 'webhooks', 'billing', 'api', 'troubleshooting')),
  
  -- Metadata
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT faqs_question_not_empty CHECK (length(trim(question)) > 0),
  CONSTRAINT faqs_answer_not_empty CHECK (length(trim(answer)) > 0)
);

-- Performance indexes for FAQs
CREATE INDEX IF NOT EXISTS faqs_category_idx ON faqs(category) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS faqs_display_order_idx ON faqs(display_order) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS faqs_search_idx ON faqs USING gin(to_tsvector('english', question || ' ' || answer)) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS faqs_trgm_idx ON faqs USING gin(question gin_trgm_ops, answer gin_trgm_ops) WHERE is_published = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Documentation
COMMENT ON TABLE faqs IS 'Frequently asked questions for the help center';
COMMENT ON COLUMN faqs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN faqs.category IS 'Category for organizing FAQs';
COMMENT ON COLUMN faqs.helpful_count IS 'Number of users who marked this FAQ as helpful';
COMMENT ON COLUMN faqs.not_helpful_count IS 'Number of users who marked this FAQ as not helpful';

-- =====================================================
-- TABLE: support_requests
-- Purpose: Store user support tickets and requests
-- =====================================================
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Core fields
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  
  -- Metadata
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}'::text[],
  internal_notes TEXT,
  resolution TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT support_requests_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT support_requests_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT support_requests_subject_not_empty CHECK (length(trim(subject)) > 0),
  CONSTRAINT support_requests_description_not_empty CHECK (length(trim(description)) > 0)
);

-- Performance indexes for support requests
CREATE INDEX IF NOT EXISTS support_requests_user_id_idx ON support_requests(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS support_requests_status_idx ON support_requests(status);
CREATE INDEX IF NOT EXISTS support_requests_urgency_idx ON support_requests(urgency);
CREATE INDEX IF NOT EXISTS support_requests_created_at_idx ON support_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS support_requests_email_idx ON support_requests(email);
CREATE INDEX IF NOT EXISTS support_requests_assigned_to_idx ON support_requests(assigned_to) WHERE assigned_to IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_support_requests_updated_at ON support_requests;
CREATE TRIGGER update_support_requests_updated_at
  BEFORE UPDATE ON support_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to set resolved_at when status changes to resolved
CREATE OR REPLACE FUNCTION set_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
  ELSIF NEW.status != 'resolved' THEN
    NEW.resolved_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_support_requests_resolved_at ON support_requests;
CREATE TRIGGER set_support_requests_resolved_at
  BEFORE UPDATE ON support_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_resolved_at();

-- Documentation
COMMENT ON TABLE support_requests IS 'User support tickets and requests';
COMMENT ON COLUMN support_requests.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN support_requests.user_id IS 'User who created the request (nullable for anonymous requests)';
COMMENT ON COLUMN support_requests.assigned_to IS 'Support staff member assigned to handle this request';

-- =====================================================
-- TABLE: help_center_interactions
-- Purpose: Track user interactions with help center for analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS help_center_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Core fields
  session_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('page_view', 'section_view', 'faq_view', 'faq_feedback', 'search', 'form_submit', 'link_click')),
  section TEXT,
  faq_id UUID REFERENCES faqs(id) ON DELETE SET NULL,
  search_query TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes for interactions
CREATE INDEX IF NOT EXISTS help_center_interactions_user_id_idx ON help_center_interactions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS help_center_interactions_session_id_idx ON help_center_interactions(session_id);
CREATE INDEX IF NOT EXISTS help_center_interactions_type_idx ON help_center_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS help_center_interactions_section_idx ON help_center_interactions(section) WHERE section IS NOT NULL;
CREATE INDEX IF NOT EXISTS help_center_interactions_faq_id_idx ON help_center_interactions(faq_id) WHERE faq_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS help_center_interactions_created_at_idx ON help_center_interactions(created_at DESC);

-- Documentation
COMMENT ON TABLE help_center_interactions IS 'Analytics tracking for help center user interactions';
COMMENT ON COLUMN help_center_interactions.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN help_center_interactions.session_id IS 'Session identifier for anonymous users';
COMMENT ON COLUMN help_center_interactions.interaction_type IS 'Type of interaction being tracked';

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- FAQs: Public read access, admin write access
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faqs_select_public"
  ON faqs FOR SELECT
  USING (is_published = true);

CREATE POLICY "faqs_select_all_authenticated"
  ON faqs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Support Requests: Users can only see their own requests
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "support_requests_select_own"
  ON support_requests FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "support_requests_insert_own"
  ON support_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "support_requests_update_own"
  ON support_requests FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = assigned_to)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = assigned_to);

-- Help Center Interactions: Users can insert their own, admins can read all
ALTER TABLE help_center_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "help_center_interactions_insert_own"
  ON help_center_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "help_center_interactions_select_own"
  ON help_center_interactions FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS help_center_interactions CASCADE;
-- DROP TABLE IF EXISTS support_requests CASCADE;
-- DROP TABLE IF EXISTS faqs CASCADE;
-- DROP FUNCTION IF EXISTS set_resolved_at() CASCADE;
