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
} from '@/api/sessions';
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
  return useMutation({
    mutationFn: (sessionId: string) => exportSessionJSON(sessionId),
    onSuccess: (data, sessionId: string) => {
      // Download the JSON file
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${sessionId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
  return useMutation({
    mutationFn: (sessionId: string) => exportSessionCSV(sessionId),
    onSuccess: (data, sessionId: string) => {
      // Download the CSV file
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${sessionId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
