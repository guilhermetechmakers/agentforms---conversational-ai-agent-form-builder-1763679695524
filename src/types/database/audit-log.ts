/**
 * Database types for audit_logs table
 * Generated: 2025-11-21T03:07:45Z
 */

export type AuditActionType =
  | 'team_member_invited'
  | 'team_member_role_changed'
  | 'team_member_removed'
  | 'team_member_accepted'
  | 'team_member_declined'
  | 'seat_added'
  | 'seat_removed'
  | 'subscription_changed'
  | 'billing_updated'
  | 'permission_changed'
  | 'settings_updated';

export type AuditEntityType =
  | 'team_member'
  | 'subscription'
  | 'billing'
  | 'settings'
  | 'permission';

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  action_type: AuditActionType;
  entity_type: AuditEntityType;
  entity_id: string | null;
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogInsert {
  id?: string;
  organization_id: string;
  user_id?: string | null;
  action_type: AuditActionType;
  entity_type: AuditEntityType;
  entity_id?: string | null;
  old_value?: Record<string, any> | null;
  new_value?: Record<string, any> | null;
  metadata?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface AuditLogUpdate {
  metadata?: Record<string, any>;
}

// Supabase query result type
export type AuditLogRow = AuditLog;
