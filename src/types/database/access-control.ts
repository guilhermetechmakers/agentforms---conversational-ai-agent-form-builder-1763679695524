/**
 * Database types for access_controls table
 * Generated: 2025-11-21T03:27:35Z
 */

export type AccessControlResourceType = 
  | 'session'
  | 'agent'
  | 'export'
  | 'webhook'
  | 'settings'
  | 'billing'
  | 'team'
  | 'all';

export type AccessControlPermissionLevel = 
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'
  | 'none';

export type AccessControlScopeType = 'user' | 'role' | 'team';

export type AccessControlStatus = 'active' | 'revoked' | 'expired';

export interface AccessControl {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  resource_type: AccessControlResourceType;
  resource_id: string | null;
  permission_level: AccessControlPermissionLevel;
  scope_type: AccessControlScopeType;
  scope_id: string | null;
  status: AccessControlStatus;
  expires_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AccessControlInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  resource_type: AccessControlResourceType;
  resource_id?: string | null;
  permission_level: AccessControlPermissionLevel;
  scope_type: AccessControlScopeType;
  scope_id?: string | null;
  status?: AccessControlStatus;
  expires_at?: string | null;
  metadata?: Record<string, any>;
}

export interface AccessControlUpdate {
  name?: string;
  description?: string | null;
  resource_type?: AccessControlResourceType;
  resource_id?: string | null;
  permission_level?: AccessControlPermissionLevel;
  scope_type?: AccessControlScopeType;
  scope_id?: string | null;
  status?: AccessControlStatus;
  expires_at?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type AccessControlRow = AccessControl;
