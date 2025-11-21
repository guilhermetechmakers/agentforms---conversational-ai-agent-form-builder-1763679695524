import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as securityPrivacyApi from '@/api/security-privacy';
import type {
  RetentionPolicyInsert,
  RetentionPolicyUpdate,
} from '@/types/database/retention-policy';
import type {
  AccessControlInsert,
  AccessControlUpdate,
} from '@/types/database/access-control';
import type {
  DSRRequestInsert,
  DSRRequestUpdate,
} from '@/types/database/dsr-request';

const QUERY_KEYS = {
  all: ['security-privacy'] as const,
  retentionPolicies: () => [...QUERY_KEYS.all, 'retention-policies'] as const,
  retentionPolicy: (id: string) => [...QUERY_KEYS.retentionPolicies(), id] as const,
  accessControls: () => [...QUERY_KEYS.all, 'access-controls'] as const,
  accessControl: (id: string) => [...QUERY_KEYS.accessControls(), id] as const,
  dsrRequests: () => [...QUERY_KEYS.all, 'dsr-requests'] as const,
  dsrRequest: (id: string) => [...QUERY_KEYS.dsrRequests(), id] as const,
  auditLogs: () => [...QUERY_KEYS.all, 'audit-logs'] as const,
  encryptionStatus: () => [...QUERY_KEYS.all, 'encryption-status'] as const,
};

/**
 * ============================================
 * RETENTION POLICIES
 * ============================================
 */

/**
 * Hook to fetch all retention policies
 */
export function useRetentionPolicies(filters?: {
  status?: 'active' | 'paused' | 'deleted';
  data_type?: string;
  agent_id?: string;
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.retentionPolicies(), filters],
    queryFn: () => securityPrivacyApi.getRetentionPolicies(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single retention policy
 */
export function useRetentionPolicy(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.retentionPolicy(id),
    queryFn: () => securityPrivacyApi.getRetentionPolicy(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Hook to create a retention policy
 */
export function useCreateRetentionPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policy: RetentionPolicyInsert) =>
      securityPrivacyApi.createRetentionPolicy(policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retentionPolicies() });
      toast.success('Retention policy created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create retention policy: ${error.message}`);
    },
  });
}

/**
 * Hook to update a retention policy
 */
export function useUpdateRetentionPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: RetentionPolicyUpdate }) =>
      securityPrivacyApi.updateRetentionPolicy(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retentionPolicies() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retentionPolicy(data.id) });
      toast.success('Retention policy updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update retention policy: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a retention policy
 */
export function useDeleteRetentionPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => securityPrivacyApi.deleteRetentionPolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.retentionPolicies() });
      toast.success('Retention policy deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete retention policy: ${error.message}`);
    },
  });
}

/**
 * ============================================
 * ACCESS CONTROLS
 * ============================================
 */

/**
 * Hook to fetch all access controls
 */
export function useAccessControls(filters?: {
  resource_type?: string;
  resource_id?: string;
  status?: 'active' | 'revoked' | 'expired';
  scope_type?: 'user' | 'role' | 'team';
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.accessControls(), filters],
    queryFn: () => securityPrivacyApi.getAccessControls(filters),
    staleTime: 30000,
  });
}

/**
 * Hook to fetch a single access control
 */
export function useAccessControl(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.accessControl(id),
    queryFn: () => securityPrivacyApi.getAccessControl(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Hook to create an access control
 */
export function useCreateAccessControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (control: AccessControlInsert) =>
      securityPrivacyApi.createAccessControl(control),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accessControls() });
      toast.success('Access control created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create access control: ${error.message}`);
    },
  });
}

/**
 * Hook to update an access control
 */
export function useUpdateAccessControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: AccessControlUpdate }) =>
      securityPrivacyApi.updateAccessControl(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accessControls() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accessControl(data.id) });
      toast.success('Access control updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update access control: ${error.message}`);
    },
  });
}

/**
 * Hook to delete an access control
 */
export function useDeleteAccessControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => securityPrivacyApi.deleteAccessControl(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accessControls() });
      toast.success('Access control deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete access control: ${error.message}`);
    },
  });
}

/**
 * ============================================
 * DATA SUBJECT REQUESTS (DSR)
 * ============================================
 */

/**
 * Hook to fetch all DSR requests
 */
export function useDSRRequests(filters?: {
  request_type?: 'export' | 'deletion' | 'portability' | 'rectification';
  status?: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.dsrRequests(), filters],
    queryFn: () => securityPrivacyApi.getDSRRequests(filters),
    staleTime: 30000,
  });
}

/**
 * Hook to fetch a single DSR request
 */
export function useDSRRequest(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.dsrRequest(id),
    queryFn: () => securityPrivacyApi.getDSRRequest(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Hook to create a DSR request
 */
export function useCreateDSRRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DSRRequestInsert) =>
      securityPrivacyApi.createDSRRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dsrRequests() });
      toast.success('Data subject request submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit request: ${error.message}`);
    },
  });
}

/**
 * Hook to update a DSR request
 */
export function useUpdateDSRRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: DSRRequestUpdate }) =>
      securityPrivacyApi.updateDSRRequest(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dsrRequests() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dsrRequest(data.id) });
      toast.success('Request updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update request: ${error.message}`);
    },
  });
}

/**
 * ============================================
 * AUDIT LOGS
 * ============================================
 */

/**
 * Hook to fetch security audit logs
 */
export function useSecurityAuditLogs(filters?: {
  action_type?: string;
  entity_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.auditLogs(), filters],
    queryFn: () => securityPrivacyApi.getSecurityAuditLogs(filters),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to export audit logs
 */
export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (filters?: {
      action_type?: string;
      entity_type?: string;
      start_date?: string;
      end_date?: string;
      format?: 'csv' | 'json';
    }) => securityPrivacyApi.exportAuditLogs(filters),
    onSuccess: (blob, variables) => {
      const format = variables?.format || 'json';
      const extension = format === 'csv' ? 'csv' : 'json';
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Audit logs exported as ${format.toUpperCase()}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to export audit logs: ${error.message}`);
    },
  });
}

/**
 * ============================================
 * ENCRYPTION STATUS
 * ============================================
 */

/**
 * Hook to fetch encryption status
 */
export function useEncryptionStatus() {
  return useQuery({
    queryKey: QUERY_KEYS.encryptionStatus(),
    queryFn: () => securityPrivacyApi.getEncryptionStatus(),
    staleTime: 60000, // 1 minute
  });
}
