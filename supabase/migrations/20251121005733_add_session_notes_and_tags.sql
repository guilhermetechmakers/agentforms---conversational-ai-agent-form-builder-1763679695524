-- =====================================================
-- Migration: Add Session Notes and Tags
-- Created: 2025-11-21T00:57:33Z
-- Tables: session_notes
-- Modifies: sessions (adds tags column)
-- Purpose: Enable session notes and tagging functionality for session management
-- =====================================================

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MODIFY: sessions table - Add tags column
-- =====================================================
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::TEXT[];

-- Add index for tags array queries
CREATE INDEX IF NOT EXISTS sessions_tags_idx ON sessions USING GIN(tags);

-- Add column for flagged status
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false;

ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS flag_reason TEXT;

CREATE INDEX IF NOT EXISTS sessions_flagged_idx ON sessions(flagged) WHERE flagged = true;

-- =====================================================
-- TABLE: session_notes
-- Purpose: Store internal notes and comments for sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS session_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Note content
  content TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT session_notes_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS session_notes_session_id_idx ON session_notes(session_id);
CREATE INDEX IF NOT EXISTS session_notes_author_id_idx ON session_notes(author_id);
CREATE INDEX IF NOT EXISTS session_notes_created_at_idx ON session_notes(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_session_notes_updated_at ON session_notes;
CREATE TRIGGER update_session_notes_updated_at
  BEFORE UPDATE ON session_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access notes for their own agent sessions
CREATE POLICY "session_notes_select_own"
  ON session_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = session_notes.session_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "session_notes_insert_own"
  ON session_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = session_notes.session_id
      AND agents.user_id = auth.uid()
    )
    AND (author_id IS NULL OR author_id = auth.uid())
  );

CREATE POLICY "session_notes_update_own"
  ON session_notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = session_notes.session_id
      AND agents.user_id = auth.uid()
    )
    AND (author_id IS NULL OR author_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = session_notes.session_id
      AND agents.user_id = auth.uid()
    )
    AND (author_id IS NULL OR author_id = auth.uid())
  );

CREATE POLICY "session_notes_delete_own"
  ON session_notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = session_notes.session_id
      AND agents.user_id = auth.uid()
    )
    AND (author_id IS NULL OR author_id = auth.uid())
  );

-- Documentation
COMMENT ON TABLE session_notes IS 'Stores internal notes and comments for sessions';
COMMENT ON COLUMN sessions.tags IS 'Array of tags for categorizing and filtering sessions';
COMMENT ON COLUMN sessions.flagged IS 'Whether the session has been flagged for review';
COMMENT ON COLUMN sessions.flag_reason IS 'Reason for flagging the session';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS session_notes CASCADE;
-- ALTER TABLE sessions DROP COLUMN IF EXISTS tags;
-- ALTER TABLE sessions DROP COLUMN IF EXISTS flagged;
-- ALTER TABLE sessions DROP COLUMN IF EXISTS flag_reason;
-- DROP INDEX IF EXISTS sessions_tags_idx;
-- DROP INDEX IF EXISTS sessions_flagged_idx;
