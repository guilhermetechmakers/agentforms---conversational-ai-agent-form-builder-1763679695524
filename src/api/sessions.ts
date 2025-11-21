import { supabase } from '@/lib/supabase';
import type { 
  SessionRow, 
  SessionInsert, 
  SessionUpdate, 
  MessageRow, 
  MessageInsert, 
  ExtractedFieldRow,
  SessionNoteRow,
  SessionNoteInsert,
  SessionNoteUpdate,
} from '@/types/database/session';
import type { WebhookDeliveryRow } from '@/types/database/webhook';

/**
 * Get agent by slug (public access)
 */
export async function getAgentBySlug(slug: string): Promise<any> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('status', 'published')
    .eq('publish->>slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch agent: ${error.message}`);
  }

  return data;
}

/**
 * Create a new session
 */
export async function createSession(session: SessionInsert): Promise<SessionRow> {
  const { data, error } = await supabase
    .from('sessions')
    .insert(session as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return data as SessionRow;
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<SessionRow | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch session: ${error.message}`);
  }

  return data;
}

/**
 * Update session
 */
export async function updateSession(sessionId: string, updates: SessionUpdate): Promise<SessionRow> {
  const sessionsTable = supabase.from('sessions') as any;
  const { data, error } = await sessionsTable
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update session: ${error.message}`);
  }

  return data as SessionRow;
}

/**
 * Get messages for a session
 */
export async function getMessages(sessionId: string): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a new message
 */
export async function createMessage(message: MessageInsert): Promise<MessageRow> {
  const { data, error } = await supabase
    .from('messages')
    .insert(message as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create message: ${error.message}`);
  }

  return data as MessageRow;
}

/**
 * Get extracted fields for a session
 */
export async function getExtractedFields(sessionId: string): Promise<ExtractedFieldRow[]> {
  const { data, error } = await supabase
    .from('extracted_fields')
    .select('*')
    .eq('session_id', sessionId)
    .order('extracted_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch extracted fields: ${error.message}`);
  }

  return data || [];
}

/**
 * Subscribe to real-time messages for a session
 */
export function subscribeToMessages(
  sessionId: string,
  callback: (message: MessageRow) => void
) {
  const channel = supabase
    .channel(`messages:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => {
        callback(payload.new as MessageRow);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to session updates
 */
export function subscribeToSession(
  sessionId: string,
  callback: (session: SessionRow) => void
) {
  const channel = supabase
    .channel(`session:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        callback(payload.new as SessionRow);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Get session notes
 */
export async function getSessionNotes(sessionId: string): Promise<SessionNoteRow[]> {
  const { data, error } = await supabase
    .from('session_notes')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch session notes: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a session note
 */
export async function createSessionNote(note: SessionNoteInsert): Promise<SessionNoteRow> {
  const { data, error } = await supabase
    .from('session_notes')
    .insert(note as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create session note: ${error.message}`);
  }

  return data as SessionNoteRow;
}

/**
 * Update a session note
 */
export async function updateSessionNote(
  noteId: string,
  updates: SessionNoteUpdate
): Promise<SessionNoteRow> {
  const sessionNotesTable = supabase.from('session_notes') as any;
  const { data, error } = await sessionNotesTable
    .update(updates)
    .eq('id', noteId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update session note: ${error.message}`);
  }

  return data as SessionNoteRow;
}

/**
 * Delete a session note
 */
export async function deleteSessionNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('session_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    throw new Error(`Failed to delete session note: ${error.message}`);
  }
}

/**
 * Get webhook deliveries for a session
 */
export async function getWebhookDeliveries(sessionId: string): Promise<WebhookDeliveryRow[]> {
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('*')
    .eq('session_id', sessionId)
    .order('started_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch webhook deliveries: ${error.message}`);
  }

  return data || [];
}

/**
 * Export session data as JSON
 */
export async function exportSessionJSON(sessionId: string): Promise<string> {
  // Fetch all session data
  const [session, messages, extractedFields, notes] = await Promise.all([
    getSession(sessionId),
    getMessages(sessionId),
    getExtractedFields(sessionId),
    getSessionNotes(sessionId),
  ]);

  if (!session) {
    throw new Error('Session not found');
  }

  const exportData = {
    session,
    messages,
    extractedFields,
    notes,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export session data as CSV
 */
export async function exportSessionCSV(sessionId: string): Promise<string> {
  const [session, messages, extractedFields] = await Promise.all([
    getSession(sessionId),
    getMessages(sessionId),
    getExtractedFields(sessionId),
  ]);

  if (!session) {
    throw new Error('Session not found');
  }

  // CSV header
  const csvRows: string[] = [];
  
  // Session metadata
  csvRows.push('Type,Field,Value');
  csvRows.push(`Session,ID,${session.id}`);
  csvRows.push(`Session,Status,${session.status}`);
  csvRows.push(`Session,Started At,${session.started_at}`);
  csvRows.push(`Session,Ended At,${session.ended_at || ''}`);
  csvRows.push(`Session,Completion Rate,${session.completion_rate}`);
  csvRows.push('');

  // Messages
  csvRows.push('Messages');
  csvRows.push('Role,Content,Timestamp');
  messages.forEach((msg) => {
    const content = msg.content.replace(/"/g, '""'); // Escape quotes
    csvRows.push(`${msg.role},"${content}",${msg.created_at}`);
  });
  csvRows.push('');

  // Extracted fields
  csvRows.push('Extracted Fields');
  csvRows.push('Field Label,Field Type,Value,Is Valid,Confidence Score');
  extractedFields.forEach((field) => {
    const value = (field.value || '').replace(/"/g, '""');
    csvRows.push(`${field.field_label},${field.field_type},"${value}",${field.is_valid},${field.confidence_score || ''}`);
  });

  return csvRows.join('\n');
}

/**
 * Resend webhook for a session
 */
export async function resendWebhook(sessionId: string, webhookId: string): Promise<WebhookDeliveryRow> {
  // This would typically be handled by a backend API endpoint
  // For now, we'll create a new delivery record
  // In production, this should trigger an actual webhook dispatch
  
  const { data: sessionData } = await supabase
    .from('sessions')
    .select('id, agent_id, status')
    .eq('id', sessionId)
    .single();

  if (!sessionData) {
    throw new Error('Session not found');
  }

  const session = sessionData as any;

  // Get webhook config
  const { data: webhook, error: webhookError } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', webhookId)
    .single();

  if (webhookError || !webhook) {
    throw new Error('Webhook not found');
  }

  const webhookData = webhook as any;

  // Create delivery record (in production, this would be done by backend)
  const { data: delivery, error } = await supabase
    .from('webhook_deliveries')
    .insert({
      webhook_id: webhookId,
      session_id: sessionId,
      status: 'pending',
      attempt_number: 1,
      max_attempts: webhookData.retry_policy?.maxAttempts || 3,
      request_url: webhookData.url,
      request_method: 'POST',
      request_headers: webhookData.secret ? { 'X-Webhook-Secret': webhookData.secret } : null,
      request_body: {
        sessionId: session.id,
        agentId: session.agent_id,
        status: session.status,
        // Add more session data as needed
      },
      started_at: new Date().toISOString(),
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create webhook delivery: ${error.message}`);
  }

  // Note: In production, this should trigger an actual webhook dispatch via backend API
  // For now, we just create the delivery record

  return delivery as WebhookDeliveryRow;
}
