-- =====================================================
-- Migration: Create Notification Preferences Table
-- Created: 2025-11-21T01:22:26Z
-- Tables: notification_preferences
-- Purpose: Store user notification preferences
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
-- TABLE: notification_preferences
-- Purpose: Store user notification preferences by type
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Notification type
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'session_completed',
    'session_failed',
    'webhook_failed',
    'agent_published',
    'team_invite',
    'billing_update',
    'security_alert',
    'weekly_summary',
    'monthly_report'
  )),
  
  -- Preference settings
  enabled BOOLEAN DEFAULT TRUE NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  in_app_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Additional settings (JSONB for flexibility)
  settings JSONB DEFAULT '{}'::jsonb, -- e.g., frequency, quiet hours, etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT notification_preferences_user_alert_unique UNIQUE (user_id, alert_type)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS notification_preferences_user_id_idx ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS notification_preferences_alert_type_idx ON notification_preferences(alert_type);
CREATE INDEX IF NOT EXISTS notification_preferences_enabled_idx ON notification_preferences(enabled) WHERE enabled = TRUE;
CREATE INDEX IF NOT EXISTS notification_preferences_email_enabled_idx ON notification_preferences(email_enabled) WHERE email_enabled = TRUE;
CREATE INDEX IF NOT EXISTS notification_preferences_created_at_idx ON notification_preferences(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own notification preferences
CREATE POLICY "notification_preferences_select_own"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notification_preferences_insert_own"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_preferences_update_own"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_preferences_delete_own"
  ON notification_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE notification_preferences IS 'User notification preferences by alert type';
COMMENT ON COLUMN notification_preferences.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN notification_preferences.user_id IS 'Owner of these preferences (references auth.users)';
COMMENT ON COLUMN notification_preferences.alert_type IS 'Type of notification alert';
COMMENT ON COLUMN notification_preferences.enabled IS 'Whether this notification type is enabled';
COMMENT ON COLUMN notification_preferences.email_enabled IS 'Whether email notifications are enabled for this type';
COMMENT ON COLUMN notification_preferences.in_app_enabled IS 'Whether in-app notifications are enabled for this type';
COMMENT ON COLUMN notification_preferences.settings IS 'Additional notification settings (JSON)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS notification_preferences CASCADE;
