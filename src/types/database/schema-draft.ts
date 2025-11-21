/**
 * Database types for schema_drafts table
 * Generated: 2025-11-21T02:21:09Z
 */

import type { AgentSchema } from '@/types/agent';

// Draft content stores the full schema structure

export interface SchemaDraft {
  id: string;
  schema_id: string | null;
  agent_id: string;
  user_id: string;
  content: AgentSchema;
  last_edited_by: string | null;
  conflict_detected: boolean;
  conflict_resolved: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface SchemaDraftInsert {
  id?: string;
  schema_id?: string | null;
  agent_id: string;
  user_id: string;
  content: AgentSchema;
  last_edited_by?: string | null;
  conflict_detected?: boolean;
  conflict_resolved?: boolean;
  expires_at?: string | null;
}

export interface SchemaDraftUpdate {
  content?: AgentSchema;
  last_edited_by?: string | null;
  conflict_detected?: boolean;
  conflict_resolved?: boolean;
  expires_at?: string | null;
}

// Supabase query result type
export type SchemaDraftRow = SchemaDraft;
