/**
 * Database types for support_requests table
 * Generated: 2025-11-21T01:41:17Z
 */

export type SupportRequestUrgency = 'low' | 'normal' | 'high' | 'urgent';
export type SupportRequestStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface SupportRequest {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  description: string;
  urgency: SupportRequestUrgency;
  status: SupportRequestStatus;
  assigned_to: string | null;
  tags: string[];
  internal_notes: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface SupportRequestInsert {
  id?: string;
  user_id?: string | null;
  name: string;
  email: string;
  subject: string;
  description: string;
  urgency?: SupportRequestUrgency;
  status?: SupportRequestStatus;
  assigned_to?: string | null;
  tags?: string[];
  internal_notes?: string | null;
  resolution?: string | null;
}

export interface SupportRequestUpdate {
  name?: string;
  email?: string;
  subject?: string;
  description?: string;
  urgency?: SupportRequestUrgency;
  status?: SupportRequestStatus;
  assigned_to?: string | null;
  tags?: string[];
  internal_notes?: string | null;
  resolution?: string | null;
}

// Supabase query result type
export type SupportRequestRow = SupportRequest;
