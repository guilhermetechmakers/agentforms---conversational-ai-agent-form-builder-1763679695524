/**
 * Database types for error_logs table
 * Generated: 2025-11-21T01:54:24Z
 */

export type ErrorType = '404' | '500' | '400' | '403' | 'network' | 'validation' | 'other';

export interface ErrorLog {
  id: string;
  user_id: string | null;
  error_type: ErrorType;
  url_attempted: string;
  http_method: string | null;
  status_code: number | null;
  error_message: string | null;
  stack_trace: string | null;
  user_agent: string | null;
  ip_address: string | null;
  support_ticket_id: string | null;
  additional_info: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ErrorLogInsert {
  id?: string;
  user_id?: string | null;
  error_type: ErrorType;
  url_attempted: string;
  http_method?: string | null;
  status_code?: number | null;
  error_message?: string | null;
  stack_trace?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  support_ticket_id?: string | null;
  additional_info?: Record<string, any>;
}

export interface ErrorLogUpdate {
  user_id?: string | null;
  error_type?: ErrorType;
  url_attempted?: string;
  http_method?: string | null;
  status_code?: number | null;
  error_message?: string | null;
  stack_trace?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  support_ticket_id?: string | null;
  additional_info?: Record<string, any>;
}

// Supabase query result type
export type ErrorLogRow = ErrorLog;
