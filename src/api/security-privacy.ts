import { supabase } from '@/lib/supabase';
import type {
  RetentionPolicyRow,
  RetentionPolicyInsert,
  RetentionPolicyUpdate,
} from '@/types/database/retention-policy';
import type {
  AccessControlRow,
  AccessControlInsert,
  AccessControlUpdate,
} from '@/types/database/access-control';
import type {
  DSRRequestRow,
  DSRRequestInsert,
  DSRRequestUpdate,
} from '@/types/database/dsr-request';
import type { AuditLogRow } from '@/types/database/audit-log';

/**
 * ============================================
 * RETENTION POLICIES
 * ============================================
 */

/**
 * Fetch all retention policies for the current user
 */
export async function getRetentionPolicies(filters?: {
  status?: 'active' | 'paused' | 'deleted';
  data_type?: string;
  agent_id?: string;
}): Promise<RetentionPolicyRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('retention_policies')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.data_type) {
    query = query.eq('data_type', filters.data_type);
  }

  if (filters?.agent_id) {
    query = query.eq('agent_id', filters.agent_id);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch retention policies: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single retention policy by ID
 */
export async function getRetentionPolicy(id: string): Promise<RetentionPolicyRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('retention_policies')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch retention policy: ${error.message}`);
  }

  return data;
}

/**
 * Create a new retention policy
 */
export async function createRetentionPolicy(
  policy: RetentionPolicyInsert
): Promise<RetentionPolicyRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('retention_policies')
    .insert({ ...policy, user_id: user.id } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create retention policy: ${error.message}`);
  }

  return data;
}

/**
 * Update a retention policy
 */
export async function updateRetentionPolicy(
  id: string,
  updates: RetentionPolicyUpdate
): Promise<RetentionPolicyRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('retention_policies')
    // @ts-ignore - Table types will be available after migrations are applied
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update retention policy: ${error.message}`);
  }

  return data;
}

/**
 * Delete a retention policy
 */
export async function deleteRetentionPolicy(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('retention_policies')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete retention policy: ${error.message}`);
  }
}

/**
 * ============================================
 * ACCESS CONTROLS
 * ============================================
 */

/**
 * Fetch all access controls for the current user
 */
export async function getAccessControls(filters?: {
  resource_type?: string;
  resource_id?: string;
  status?: 'active' | 'revoked' | 'expired';
  scope_type?: 'user' | 'role' | 'team';
}): Promise<AccessControlRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('access_controls')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filters?.resource_type) {
    query = query.eq('resource_type', filters.resource_type);
  }

  if (filters?.resource_id) {
    query = query.eq('resource_id', filters.resource_id);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.scope_type) {
    query = query.eq('scope_type', filters.scope_type);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch access controls: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single access control by ID
 */
export async function getAccessControl(id: string): Promise<AccessControlRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('access_controls')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch access control: ${error.message}`);
  }

  return data;
}

/**
 * Create a new access control
 */
export async function createAccessControl(
  control: AccessControlInsert
): Promise<AccessControlRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('access_controls')
    .insert({ ...control, user_id: user.id } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create access control: ${error.message}`);
  }

  return data;
}

/**
 * Update an access control
 */
export async function updateAccessControl(
  id: string,
  updates: AccessControlUpdate
): Promise<AccessControlRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('access_controls')
    // @ts-ignore - Table types will be available after migrations are applied
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update access control: ${error.message}`);
  }

  return data;
}

/**
 * Delete an access control
 */
export async function deleteAccessControl(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('access_controls')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete access control: ${error.message}`);
  }
}

/**
 * ============================================
 * DATA SUBJECT REQUESTS (DSR)
 * ============================================
 */

/**
 * Fetch all DSR requests for the current user
 */
export async function getDSRRequests(filters?: {
  request_type?: 'export' | 'deletion' | 'portability' | 'rectification';
  status?: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
}): Promise<DSRRequestRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('dsr_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false });

  if (filters?.request_type) {
    query = query.eq('request_type', filters.request_type);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch DSR requests: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single DSR request by ID
 */
export async function getDSRRequest(id: string): Promise<DSRRequestRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('dsr_requests')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch DSR request: ${error.message}`);
  }

  return data;
}

/**
 * Create a new DSR request
 */
export async function createDSRRequest(
  request: DSRRequestInsert
): Promise<DSRRequestRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Set due date to 30 days from now (GDPR requirement)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  // Generate verification token
  const verificationToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  const { data, error } = await supabase
    .from('dsr_requests')
    .insert({
      ...request,
      user_id: user.id,
      submitted_at: new Date().toISOString(),
      due_date: dueDate.toISOString(),
      verification_token: verificationToken,
      verification_method: 'email',
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create DSR request: ${error.message}`);
  }

  return data;
}

/**
 * Update a DSR request
 */
export async function updateDSRRequest(
  id: string,
  updates: DSRRequestUpdate
): Promise<DSRRequestRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('dsr_requests')
    // @ts-ignore - Table types will be available after migrations are applied
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update DSR request: ${error.message}`);
  }

  return data;
}

/**
 * ============================================
 * AUDIT LOGS (Security & Privacy)
 * ============================================
 */

/**
 * Fetch audit logs with security/privacy filters
 */
export async function getSecurityAuditLogs(filters?: {
  action_type?: string;
  entity_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}): Promise<AuditLogRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('organization_id', user.id)
    .order('created_at', { ascending: false });

  if (filters?.action_type) {
    query = query.eq('action_type', filters.action_type);
  }

  if (filters?.entity_type) {
    query = query.eq('entity_type', filters.entity_type);
  }

  if (filters?.start_date) {
    query = query.gte('created_at', filters.start_date);
  }

  if (filters?.end_date) {
    query = query.lte('created_at', filters.end_date);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  } else {
    query = query.limit(100);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }

  return data || [];
}

/**
 * Export audit logs to CSV/JSON
 */
export async function exportAuditLogs(filters?: {
  action_type?: string;
  entity_type?: string;
  start_date?: string;
  end_date?: string;
  format?: 'csv' | 'json';
}): Promise<Blob> {
  const logs = await getSecurityAuditLogs({
    ...filters,
    limit: 10000, // Max export limit
  });

  if (filters?.format === 'csv') {
    // Convert to CSV
    const headers = ['Timestamp', 'Action Type', 'Entity Type', 'User ID', 'Entity ID', 'Details'];
    const rows = logs.map(log => [
      log.created_at,
      log.action_type,
      log.entity_type,
      log.user_id || '',
      log.entity_id || '',
      JSON.stringify(log.metadata || {}),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  } else {
    // JSON format
    return new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  }
}

/**
 * ============================================
 * ENCRYPTION STATUS
 * ============================================
 */

/**
 * Get encryption status for user data
 */
export async function getEncryptionStatus(): Promise<{
  field_level_encryption_enabled: boolean;
  encrypted_fields_count: number;
  last_key_rotation: string | null;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check security settings
  const { data: securitySettings } = await supabase
    .from('security_settings')
    .select('field_level_encryption_enabled, last_key_rotation')
    .eq('user_id', user.id)
    .single();

  // Count encrypted fields (this would be a computed value in production)
  // For now, return mock data structure
  const settings = securitySettings as any;
  return {
    field_level_encryption_enabled: settings?.field_level_encryption_enabled || false,
    encrypted_fields_count: 0, // Would be computed from actual encrypted fields
    last_key_rotation: settings?.last_key_rotation || null,
  };
}
