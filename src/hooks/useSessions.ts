import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSession,
  getSession,
  updateSession,
  getAgentBySlug,
  getSessionsForAgent,
  getSessionMetrics,
  bulkExportSessionsJSON,
  bulkExportSessionsCSV,
  bulkDeleteSessions,
  bulkMarkSessionsReviewed,
  type GetSessionsFilters,
} from '@/api/sessions';
import type { SessionInsert, SessionUpdate } from '@/types/database/session';
import { toast } from 'sonner';

/**
 * Get agent by slug (public)
 */
export function usePublicAgent(slug: string) {
  return useQuery({
    queryKey: ['agent', 'public', slug],
    queryFn: () => getAgentBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get session by ID
 */
export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
  });
}

/**
 * Create a new session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (session: SessionInsert) => createSession(session),
    onSuccess: (data) => {
      queryClient.setQueryData(['session', data.id], data);
    },
  });
}

/**
 * Update session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, updates }: { sessionId: string; updates: SessionUpdate }) =>
      updateSession(sessionId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['session', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

/**
 * Get sessions for an agent with filters
 */
export function useAgentSessions(filters: GetSessionsFilters = {}) {
  return useQuery({
    queryKey: ['sessions', 'agent', filters],
    queryFn: () => getSessionsForAgent(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get session metrics
 */
export function useSessionMetrics(agentId?: string) {
  return useQuery({
    queryKey: ['sessions', 'metrics', agentId],
    queryFn: () => getSessionMetrics(agentId),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Bulk export sessions as JSON
 */
export function useBulkExportSessionsJSON() {
  return useMutation({
    mutationFn: (sessionIds: string[]) => bulkExportSessionsJSON(sessionIds),
    onSuccess: (data, sessionIds) => {
      // Download the JSON file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sessions-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${sessionIds.length} session(s) as JSON`);
    },
    onError: (error) => {
      toast.error(`Failed to export sessions: ${error.message}`);
    },
  });
}

/**
 * Bulk export sessions as CSV
 */
export function useBulkExportSessionsCSV() {
  return useMutation({
    mutationFn: (sessionIds: string[]) => bulkExportSessionsCSV(sessionIds),
    onSuccess: (data, sessionIds) => {
      // Download the CSV file
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sessions-export-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${sessionIds.length} session(s) as CSV`);
    },
    onError: (error) => {
      toast.error(`Failed to export sessions: ${error.message}`);
    },
  });
}

/**
 * Bulk delete sessions
 */
export function useBulkDeleteSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionIds: string[]) => bulkDeleteSessions(sessionIds),
    onSuccess: (_, sessionIds) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'metrics'] });
      toast.success(`Deleted ${sessionIds.length} session(s)`);
    },
    onError: (error) => {
      toast.error(`Failed to delete sessions: ${error.message}`);
    },
  });
}

/**
 * Bulk mark sessions as reviewed
 */
export function useBulkMarkSessionsReviewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionIds: string[]) => bulkMarkSessionsReviewed(sessionIds),
    onSuccess: (_, sessionIds) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success(`Marked ${sessionIds.length} session(s) as reviewed`);
    },
    onError: (error) => {
      toast.error(`Failed to mark sessions as reviewed: ${error.message}`);
    },
  });
}
