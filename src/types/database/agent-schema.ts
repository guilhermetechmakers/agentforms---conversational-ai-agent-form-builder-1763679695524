/**
 * Database types for agent_schemas table
 * Generated: 2025-11-21T02:21:09Z
 */

export interface AgentSchema {
  id: string;
  agent_id: string;
  user_id: string;
  name: string;
  version: number;
  is_published: boolean;
  is_locked: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface AgentSchemaInsert {
  id?: string;
  agent_id: string;
  user_id: string;
  name: string;
  version?: number;
  is_published?: boolean;
  is_locked?: boolean;
  description?: string | null;
  published_at?: string | null;
}

export interface AgentSchemaUpdate {
  name?: string;
  version?: number;
  is_published?: boolean;
  is_locked?: boolean;
  description?: string | null;
  published_at?: string | null;
}

// Supabase query result type
export type AgentSchemaRow = AgentSchema;
