import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getSessionNotes,
  createSessionNote,
  updateSessionNote,
  deleteSessionNote,
  getWebhookDeliveries,
  exportSessionJSON,
  exportSessionCSV,
  resendWebhook,
  getMessages,
  getExtractedFields,
  updateSession,
  getSession,
} from '@/api/sessions';
import { createExport, markExportCompleted, markExportFailed } from '@/api/exports';
import type {
  SessionNoteInsert,
  SessionNoteUpdate,
  SessionUpdate,
} from '@/types/database/session';

/**
 * Get session messages
 */
export function useSessionMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ['session', sessionId, 'messages'],
    queryFn: () => getMessages(sessionId!),
    enabled: !!sessionId,
  });
}

/**
 * Get extracted fields for a session
 */
export function useExtractedFields(sessionId: string | null) {
  return useQuery({
    queryKey: ['session', sessionId, 'extracted-fields'],
    queryFn: () => getExtractedFields(sessionId!),
    enabled: !!sessionId,
  });
}

/**
 * Get session notes
 */
export function useSessionNotes(sessionId: string | null) {
  return useQuery({
    queryKey: ['session', sessionId, 'notes'],
    queryFn: () => getSessionNotes(sessionId!),
    enabled: !!sessionId,
  });
}

/**
 * Create a session note
 */
export function useCreateSessionNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note: SessionNoteInsert) => createSessionNote(note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['session', data.session_id, 'notes'] });
      toast.success('Note added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
}

/**
 * Update a session note
 */
export function useUpdateSessionNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, updates }: { noteId: string; updates: SessionNoteUpdate }) =>
      updateSessionNote(noteId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['session', data.session_id, 'notes'] });
      toast.success('Note updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update note: ${error.message}`);
    },
  });
}

/**
 * Delete a session note
 */
export function useDeleteSessionNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, sessionId: _sessionId }: { noteId: string; sessionId: string }) =>
      deleteSessionNote(noteId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session', variables.sessionId, 'notes'] });
      toast.success('Note deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete note: ${error.message}`);
    },
  });
}

/**
 * Get webhook deliveries for a session
 */
export function useWebhookDeliveries(sessionId: string | null) {
  return useQuery({
    queryKey: ['session', sessionId, 'webhook-deliveries'],
    queryFn: () => getWebhookDeliveries(sessionId!),
    enabled: !!sessionId,
  });
}

/**
 * Export session as JSON
 */
export function useExportSessionJSON() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      // Get session to find agent_id
      const session = await getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Create export record
      const exportRecord = await createExport({
        format: 'json',
        session_ids: [sessionId],
        agent_id: session.agent_id,
        status: 'processing',
        total_sessions: 1,
        filters: {},
      });

      try {
        // Generate export data
        const data = await exportSessionJSON(sessionId);
        
        // Calculate file size
        const blob = new Blob([data], { type: 'application/json' });
        const fileSizeBytes = blob.size;

        // Download the JSON file
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-${sessionId}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Mark export as completed
        await markExportCompleted(exportRecord.id, null, null, fileSizeBytes);

        return { data, exportId: exportRecord.id };
      } catch (error: any) {
        // Mark export as failed
        await markExportFailed(exportRecord.id, error.message || 'Export failed', {
          sessionId,
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
      toast.success('Session exported as JSON');
    },
    onError: (error: Error) => {
      toast.error(`Failed to export session: ${error.message}`);
    },
  });
}

/**
 * Export session as CSV
 */
export function useExportSessionCSV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      // Get session to find agent_id
      const session = await getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Create export record
      const exportRecord = await createExport({
        format: 'csv',
        session_ids: [sessionId],
        agent_id: session.agent_id,
        status: 'processing',
        total_sessions: 1,
        filters: {},
      });

      try {
        // Generate export data
        const data = await exportSessionCSV(sessionId);
        
        // Calculate file size
        const blob = new Blob([data], { type: 'text/csv' });
        const fileSizeBytes = blob.size;

        // Download the CSV file
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-${sessionId}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Mark export as completed
        await markExportCompleted(exportRecord.id, null, null, fileSizeBytes);

        return { data, exportId: exportRecord.id };
      } catch (error: any) {
        // Mark export as failed
        await markExportFailed(exportRecord.id, error.message || 'Export failed', {
          sessionId,
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
      toast.success('Session exported as CSV');
    },
    onError: (error: Error) => {
      toast.error(`Failed to export session: ${error.message}`);
    },
  });
}

/**
 * Resend webhook for a session
 */
export function useResendWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, webhookId }: { sessionId: string; webhookId: string }) =>
      resendWebhook(sessionId, webhookId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['session', variables.sessionId, 'webhook-deliveries'],
      });
      toast.success('Webhook resend initiated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resend webhook: ${error.message}`);
    },
  });
}

/**
 * Update session (for tags, flagged status, etc.)
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, updates }: { sessionId: string; updates: SessionUpdate }) =>
      updateSession(sessionId, updates),
    onSuccess: (updatedSession, _variables) => {
      queryClient.setQueryData(['session', updatedSession.id], updatedSession);
      queryClient.invalidateQueries({ queryKey: ['session', updatedSession.id] });
      toast.success('Session updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update session: ${error.message}`);
    },
  });
}
