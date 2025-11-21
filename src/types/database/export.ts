/**
 * Database types for exports table
 * Generated: 2025-11-21T02:51:00Z
 */

export interface Export {
  id: string;
  user_id: string;
  format: 'json' | 'csv';
  session_ids: string[];
  agent_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_path: string | null;
  file_size_bytes: number | null;
  file_url: string | null;
  filters: Record<string, any>;
  total_sessions: number;
  error_message: string | null;
  error_details: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ExportInsert {
  id?: string;
  user_id?: string; // Added automatically by API
  format: 'json' | 'csv';
  session_ids: string[];
  agent_id?: string | null;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  file_path?: string | null;
  file_size_bytes?: number | null;
  file_url?: string | null;
  filters?: Record<string, any>;
  total_sessions?: number;
  error_message?: string | null;
  error_details?: Record<string, any> | null;
  completed_at?: string | null;
}

export interface ExportUpdate {
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  file_path?: string | null;
  file_size_bytes?: number | null;
  file_url?: string | null;
  filters?: Record<string, any>;
  total_sessions?: number;
  error_message?: string | null;
  error_details?: Record<string, any> | null;
  completed_at?: string | null;
}

// Supabase query result type
export type ExportRow = Export;
