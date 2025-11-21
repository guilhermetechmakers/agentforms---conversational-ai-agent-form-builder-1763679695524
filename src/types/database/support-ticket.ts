/**
 * Database types for support_tickets table
 * Generated: 2025-11-21T01:54:24Z
 */

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  user_id: string | null;
  subject: string;
  description: string;
  email: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  error_log_id: string | null;
  agent_id: string | null;
  session_id: string | null;
  attachments: string[] | Record<string, any>[];
  metadata: Record<string, any>;
  admin_notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
}

export interface SupportTicketInsert {
  id?: string;
  user_id?: string | null;
  subject: string;
  description: string;
  email: string;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  error_log_id?: string | null;
  agent_id?: string | null;
  session_id?: string | null;
  attachments?: string[] | Record<string, any>[];
  metadata?: Record<string, any>;
  admin_notes?: string | null;
  assigned_to?: string | null;
}

export interface SupportTicketUpdate {
  user_id?: string | null;
  subject?: string;
  description?: string;
  email?: string;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  error_log_id?: string | null;
  agent_id?: string | null;
  session_id?: string | null;
  attachments?: string[] | Record<string, any>[];
  metadata?: Record<string, any>;
  admin_notes?: string | null;
  assigned_to?: string | null;
}

// Supabase query result type
export type SupportTicketRow = SupportTicket;
