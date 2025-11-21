/**
 * Database types for retention_policies table
 * Generated: 2025-11-21T03:27:34Z
 */

export type RetentionPolicyDataType = 
  | 'sessions'
  | 'messages'
  | 'extracted_fields'
  | 'agent_data'
  | 'user_data'
  | 'audit_logs'
  | 'all';

export type RetentionPolicyStatus = 'active' | 'paused' | 'deleted';

export interface RetentionPolicy {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  data_type: RetentionPolicyDataType;
  retention_period_days: number;
  status: RetentionPolicyStatus;
  auto_delete_enabled: boolean;
  notify_before_days: number;
  agent_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_executed_at: string | null;
  next_execution_at: string | null;
}

export interface RetentionPolicyInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  data_type: RetentionPolicyDataType;
  retention_period_days: number;
  status?: RetentionPolicyStatus;
  auto_delete_enabled?: boolean;
  notify_before_days?: number;
  agent_id?: string | null;
  metadata?: Record<string, any>;
  last_executed_at?: string | null;
  next_execution_at?: string | null;
}

export interface RetentionPolicyUpdate {
  name?: string;
  description?: string | null;
  data_type?: RetentionPolicyDataType;
  retention_period_days?: number;
  status?: RetentionPolicyStatus;
  auto_delete_enabled?: boolean;
  notify_before_days?: number;
  agent_id?: string | null;
  metadata?: Record<string, any>;
  last_executed_at?: string | null;
  next_execution_at?: string | null;
}

// Supabase query result type
export type RetentionPolicyRow = RetentionPolicy;
