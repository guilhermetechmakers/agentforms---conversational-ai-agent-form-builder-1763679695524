/**
 * Database types for sessions, messages, and extracted_fields tables
 * Generated: 2025-11-21T00:34:11Z
 */

export interface Session {
  id: string;
  agent_id: string;
  visitor_id: string | null;
  status: 'active' | 'completed' | 'abandoned' | 'error';
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  completion_rate: number;
  required_fields_count: number;
  completed_fields_count: number;
  tags: string[];
  flagged: boolean;
  flag_reason: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionInsert {
  id?: string;
  agent_id: string;
  visitor_id?: string | null;
  status?: 'active' | 'completed' | 'abandoned' | 'error';
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  completion_rate?: number;
  required_fields_count?: number;
  completed_fields_count?: number;
  tags?: string[];
  flagged?: boolean;
  flag_reason?: string | null;
  started_at?: string;
  ended_at?: string | null;
}

export interface SessionUpdate {
  visitor_id?: string | null;
  status?: 'active' | 'completed' | 'abandoned' | 'error';
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  completion_rate?: number;
  required_fields_count?: number;
  completed_fields_count?: number;
  tags?: string[];
  flagged?: boolean;
  flag_reason?: string | null;
  ended_at?: string | null;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'agent' | 'visitor' | 'system';
  content: string;
  metadata: Record<string, any>;
  validation_state: string | null;
  validation_errors: Record<string, any> | null;
  created_at: string;
}

export interface MessageInsert {
  id?: string;
  session_id: string;
  role: 'agent' | 'visitor' | 'system';
  content: string;
  metadata?: Record<string, any>;
  validation_state?: string | null;
  validation_errors?: Record<string, any> | null;
}

export interface ExtractedField {
  id: string;
  session_id: string;
  agent_id: string;
  field_id: string;
  field_label: string;
  field_type: string;
  value: string | null;
  raw_value: string | null;
  is_valid: boolean;
  validation_errors: Record<string, any> | null;
  confidence_score: number | null;
  source_message_id: string | null;
  extracted_at: string;
  created_at: string;
  updated_at: string;
}

export interface ExtractedFieldInsert {
  id?: string;
  session_id: string;
  agent_id: string;
  field_id: string;
  field_label: string;
  field_type: string;
  value?: string | null;
  raw_value?: string | null;
  is_valid?: boolean;
  validation_errors?: Record<string, any> | null;
  confidence_score?: number | null;
  source_message_id?: string | null;
  extracted_at?: string;
}

// Session Note types
export interface SessionNote {
  id: string;
  session_id: string;
  author_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface SessionNoteInsert {
  id?: string;
  session_id: string;
  author_id?: string | null;
  content: string;
}

export interface SessionNoteUpdate {
  content?: string;
}

// Supabase query result types
export type SessionRow = Session;
export type MessageRow = Message;
export type ExtractedFieldRow = ExtractedField;
export type SessionNoteRow = SessionNote;
