/**
 * Database types for knowledge_snippets table
 * Generated: 2025-11-21T02:33:49Z
 */

export interface KnowledgeSnippet {
  id: string;
  agent_id: string;
  user_id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeSnippetInsert {
  id?: string;
  agent_id: string;
  user_id?: string;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[];
  display_order?: number;
}

export interface KnowledgeSnippetUpdate {
  title?: string;
  content?: string;
  category?: string | null;
  tags?: string[];
  display_order?: number;
}

// Supabase query result type
export type KnowledgeSnippetRow = KnowledgeSnippet;
