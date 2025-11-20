-- =====================================================
-- Migration: Create Landing Page Tracking and Content Tables
-- Created: 2025-11-21T00:11:26Z
-- Tables: landing_page_tracking, landing_page_content
-- Purpose: Track user interactions on landing page and manage dynamic content
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
-- TABLE: landing_page_tracking
-- Purpose: Track user interactions and conversion events on landing page
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_page_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Session tracking
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Visitor information
  referral_source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  user_agent TEXT,
  ip_address INET,
  
  -- Interaction tracking
  page_views INTEGER DEFAULT 1,
  time_on_page INTEGER, -- seconds
  scroll_depth INTEGER, -- percentage (0-100)
  cta_clicks JSONB DEFAULT '[]'::jsonb, -- Array of CTA click events
  demo_interactions INTEGER DEFAULT 0,
  pricing_modal_opens INTEGER DEFAULT 0,
  
  -- Conversion tracking
  conversion_status TEXT DEFAULT 'visitor' CHECK (conversion_status IN ('visitor', 'signup_clicked', 'demo_started', 'converted')),
  converted_at TIMESTAMPTZ,
  
  -- Timestamps
  first_visit_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_visit_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS landing_page_tracking_session_id_idx ON landing_page_tracking(session_id);
CREATE INDEX IF NOT EXISTS landing_page_tracking_user_id_idx ON landing_page_tracking(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS landing_page_tracking_conversion_status_idx ON landing_page_tracking(conversion_status);
CREATE INDEX IF NOT EXISTS landing_page_tracking_created_at_idx ON landing_page_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS landing_page_tracking_referral_source_idx ON landing_page_tracking(referral_source) WHERE referral_source IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_landing_page_tracking_updated_at ON landing_page_tracking;
CREATE TRIGGER update_landing_page_tracking_updated_at
  BEFORE UPDATE ON landing_page_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE landing_page_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public inserts for tracking, users can view their own data, admins can view all
CREATE POLICY "landing_page_tracking_insert_public"
  ON landing_page_tracking FOR INSERT
  WITH CHECK (true); -- Allow public inserts for tracking

CREATE POLICY "landing_page_tracking_select_own"
  ON landing_page_tracking FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Admin can view all (assuming admin role check - adjust based on your auth setup)
CREATE POLICY "landing_page_tracking_select_admin"
  ON landing_page_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- =====================================================
-- TABLE: landing_page_content
-- Purpose: Store dynamic content for landing page sections (CMS-like)
-- =====================================================
CREATE TABLE IF NOT EXISTS landing_page_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Content identification
  section_key TEXT NOT NULL UNIQUE, -- e.g., 'hero_headline', 'feature_1_title', 'testimonial_1'
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'html', 'json', 'image_url', 'video_url')),
  
  -- Content data
  content_value TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional structured data
  
  -- Content management
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT landing_page_content_section_key_not_empty CHECK (length(trim(section_key)) > 0),
  CONSTRAINT landing_page_content_value_not_empty CHECK (length(trim(content_value)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS landing_page_content_section_key_idx ON landing_page_content(section_key);
CREATE INDEX IF NOT EXISTS landing_page_content_is_active_idx ON landing_page_content(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS landing_page_content_display_order_idx ON landing_page_content(display_order);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_landing_page_content_updated_at ON landing_page_content;
CREATE TRIGGER update_landing_page_content_updated_at
  BEFORE UPDATE ON landing_page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE landing_page_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read for active content, authenticated users can manage
CREATE POLICY "landing_page_content_select_public"
  ON landing_page_content FOR SELECT
  USING (is_active = true); -- Public can only read active content

CREATE POLICY "landing_page_content_all_authenticated"
  ON landing_page_content FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Documentation
COMMENT ON TABLE landing_page_tracking IS 'Tracks user interactions and conversion events on the landing page';
COMMENT ON COLUMN landing_page_tracking.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN landing_page_tracking.session_id IS 'Unique session identifier for anonymous visitors';
COMMENT ON COLUMN landing_page_tracking.conversion_status IS 'Current conversion status: visitor, signup_clicked, demo_started, converted';

COMMENT ON TABLE landing_page_content IS 'Stores dynamic content for landing page sections (CMS functionality)';
COMMENT ON COLUMN landing_page_content.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN landing_page_content.section_key IS 'Unique identifier for the content section (e.g., hero_headline)';
COMMENT ON COLUMN landing_page_content.content_type IS 'Type of content: text, html, json, image_url, video_url';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS landing_page_content CASCADE;
-- DROP TABLE IF EXISTS landing_page_tracking CASCADE;
