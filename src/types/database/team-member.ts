/**
 * Database types for team_members table
 * Generated: 2025-11-21T01:22:23Z
 */

export interface TeamMember {
  id: string;
  organization_id: string;
  user_id: string | null;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invite_status: 'pending' | 'accepted' | 'declined';
  invite_token: string | null;
  invited_by: string | null;
  invited_at: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberInsert {
  id?: string;
  organization_id: string;
  user_id?: string | null;
  email: string;
  role?: 'admin' | 'member' | 'viewer';
  invite_status?: 'pending' | 'accepted' | 'declined';
  invite_token?: string | null;
  invited_by?: string | null;
}

export interface TeamMemberUpdate {
  user_id?: string | null;
  role?: 'admin' | 'member' | 'viewer';
  invite_status?: 'pending' | 'accepted' | 'declined';
  invite_token?: string | null;
}

// Supabase query result type
export type TeamMemberRow = TeamMember;
