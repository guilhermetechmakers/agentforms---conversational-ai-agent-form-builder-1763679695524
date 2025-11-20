/**
 * Database types for agents table
 * Generated: 2025-11-21T00:34:10Z
 */

import type { AgentSchema, AgentPersona, AgentKnowledge, AgentVisuals, AgentPublish } from '@/types/agent';

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  schema: AgentSchema;
  persona: AgentPersona;
  knowledge: AgentKnowledge | null;
  visuals: AgentVisuals;
  publish: AgentPublish;
  tags: string[];
  sessions_count: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentInsert {
  id?: string;
  user_id: string;
  name: string;
  status?: 'draft' | 'published' | 'archived';
  schema?: AgentSchema;
  persona?: AgentPersona;
  knowledge?: AgentKnowledge | null;
  visuals?: AgentVisuals;
  publish?: AgentPublish;
  tags?: string[];
  sessions_count?: number;
  last_activity_at?: string | null;
}

export interface AgentUpdate {
  name?: string;
  status?: 'draft' | 'published' | 'archived';
  schema?: AgentSchema;
  persona?: AgentPersona;
  knowledge?: AgentKnowledge | null;
  visuals?: AgentVisuals;
  publish?: AgentPublish;
  tags?: string[];
  sessions_count?: number;
  last_activity_at?: string | null;
}

// Supabase query result type
export type AgentRow = Agent;
