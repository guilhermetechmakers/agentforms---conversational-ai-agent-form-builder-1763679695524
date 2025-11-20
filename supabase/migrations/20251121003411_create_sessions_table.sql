-- =====================================================
-- Migration: Create Sessions Table
-- Created: 2025-11-21T00:34:11Z
-- Tables: sessions, messages, extracted_fields
-- Purpose: Store session data, messages, and extracted field values from agent conversations
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
-- TABLE: sessions
-- Purpose: Store session metadata for agent conversations
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  
  -- Session metadata
  visitor_id TEXT, -- Anonymous visitor identifier
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned', 'error')),
  
  -- Visitor information
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Session metrics
  completion_rate DECIMAL(5, 2) DEFAULT 0, -- Percentage of required fields completed
  required_fields_count INTEGER DEFAULT 0,
  completed_fields_count INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS sessions_agent_id_idx ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS sessions_status_idx ON sessions(status);
CREATE INDEX IF NOT EXISTS sessions_started_at_idx ON sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS sessions_visitor_id_idx ON sessions(visitor_id) WHERE visitor_id IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update agent sessions_count
CREATE OR REPLACE FUNCTION update_agent_sessions_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE agents
    SET sessions_count = sessions_count + 1
    WHERE id = NEW.agent_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE agents
    SET sessions_count = GREATEST(0, sessions_count - 1)
    WHERE id = OLD.agent_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update agent sessions_count
DROP TRIGGER IF EXISTS trigger_update_agent_sessions_count ON sessions;
CREATE TRIGGER trigger_update_agent_sessions_count
  AFTER INSERT OR DELETE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_sessions_count();

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access sessions for their own agents
CREATE POLICY "sessions_select_own"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = sessions.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "sessions_insert_public"
  ON sessions FOR INSERT
  WITH CHECK (true); -- Allow public inserts for agent sessions

CREATE POLICY "sessions_update_own"
  ON sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = sessions.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- =====================================================
-- TABLE: messages
-- Purpose: Store individual messages in a session
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('agent', 'visitor', 'system')),
  content TEXT NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  validation_state TEXT, -- 'valid', 'invalid', 'pending'
  validation_errors JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages(session_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
CREATE INDEX IF NOT EXISTS messages_role_idx ON messages(role);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access messages for their own agent sessions
CREATE POLICY "messages_select_own"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = messages.session_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_public"
  ON messages FOR INSERT
  WITH CHECK (true); -- Allow public inserts for agent sessions

-- =====================================================
-- TABLE: extracted_fields
-- Purpose: Store extracted field values from session conversations
-- =====================================================
CREATE TABLE IF NOT EXISTS extracted_fields (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  
  -- Field identification
  field_id TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  
  -- Extracted value
  value TEXT,
  raw_value TEXT, -- Original user input before processing
  
  -- Validation
  is_valid BOOLEAN DEFAULT true,
  validation_errors JSONB,
  confidence_score DECIMAL(5, 2), -- 0-100 confidence in extraction
  
  -- Source tracking
  source_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  
  -- Timestamps
  extracted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS extracted_fields_session_id_idx ON extracted_fields(session_id);
CREATE INDEX IF NOT EXISTS extracted_fields_agent_id_idx ON extracted_fields(agent_id);
CREATE INDEX IF NOT EXISTS extracted_fields_field_id_idx ON extracted_fields(field_id);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_extracted_fields_updated_at ON extracted_fields;
CREATE TRIGGER update_extracted_fields_updated_at
  BEFORE UPDATE ON extracted_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE extracted_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access extracted fields for their own agent sessions
CREATE POLICY "extracted_fields_select_own"
  ON extracted_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = extracted_fields.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "extracted_fields_insert_public"
  ON extracted_fields FOR INSERT
  WITH CHECK (true); -- Allow public inserts for agent sessions

CREATE POLICY "extracted_fields_update_own"
  ON extracted_fields FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agents
      WHERE agents.id = extracted_fields.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- Documentation
COMMENT ON TABLE sessions IS 'Stores session metadata for agent conversations';
COMMENT ON TABLE messages IS 'Stores individual messages in a session';
COMMENT ON TABLE extracted_fields IS 'Stores extracted field values from session conversations';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS extracted_fields CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS sessions CASCADE;
