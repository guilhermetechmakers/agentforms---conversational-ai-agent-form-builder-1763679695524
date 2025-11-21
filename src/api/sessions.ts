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
 * Create an extracted field
 */
export async function createExtractedField(field: any): Promise<ExtractedFieldRow> {
  const { data, error } = await supabase
    .from('extracted_fields')
    .insert(field)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create extracted field: ${error.message}`);
  }

  return data as ExtractedFieldRow;
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

/**
 * Get sessions for an agent with filters
 */
export interface GetSessionsFilters {
  agentId?: string;
  visitorId?: string;
  status?: 'active' | 'completed' | 'abandoned' | 'error';
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  completionRateMin?: number;
  flagged?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface GetSessionsResult {
  sessions: SessionRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getSessionsForAgent(
  filters: GetSessionsFilters = {}
): Promise<GetSessionsResult> {
  const {
    agentId,
    visitorId,
    status,
    tags,
    dateFrom,
    dateTo,
    completionRateMin,
    flagged,
    search,
    page = 1,
    pageSize = 20,
  } = filters;

  let query = supabase
    .from('sessions')
    .select('*', { count: 'exact' });

  // Apply filters
  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  if (visitorId) {
    query = query.eq('visitor_id', visitorId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (tags && tags.length > 0) {
    query = query.contains('tags', tags);
  }

  if (dateFrom) {
    query = query.gte('started_at', dateFrom);
  }

  if (dateTo) {
    query = query.lte('started_at', dateTo);
  }

  if (completionRateMin !== undefined) {
    query = query.gte('completion_rate', completionRateMin);
  }

  if (flagged !== undefined) {
    query = query.eq('flagged', flagged);
  }

  if (search) {
    // Search in visitor_id or other text fields
    query = query.ilike('visitor_id', `%${search}%`);
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Order by most recent first
  query = query.order('started_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    sessions: (data || []) as SessionRow[],
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Get session metrics for an agent
 */
export interface SessionMetrics {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  averageCompletionRate: number;
  averageDuration: number; // in minutes
  sessionsThisMonth: number;
  completionRateThisMonth: number;
}

export async function getSessionMetrics(agentId?: string): Promise<SessionMetrics> {
  let query = supabase
    .from('sessions')
    .select('status, completion_rate, started_at, ended_at');

  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch session metrics: ${error.message}`);
  }

  const sessions = (data || []) as SessionRow[];

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((s) => s.status === 'active').length;
  const completedSessions = sessions.filter((s) => s.status === 'completed').length;
  const abandonedSessions = sessions.filter((s) => s.status === 'abandoned').length;

  const completionRates = sessions
    .map((s) => Number(s.completion_rate) || 0)
    .filter((rate) => rate > 0);
  const averageCompletionRate =
    completionRates.length > 0
      ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
      : 0;

  // Calculate average duration
  const durations = sessions
    .filter((s) => s.ended_at && s.started_at)
    .map((s) => {
      const start = new Date(s.started_at);
      const end = new Date(s.ended_at!);
      return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    });
  const averageDuration =
    durations.length > 0
      ? durations.reduce((sum, dur) => sum + dur, 0) / durations.length
      : 0;

  // This month's metrics
  const sessionsThisMonth = sessions.filter((s) => {
    const startedAt = new Date(s.started_at);
    return startedAt >= thisMonthStart;
  }).length;

  const completionRatesThisMonth = sessions
    .filter((s) => {
      const startedAt = new Date(s.started_at);
      return startedAt >= thisMonthStart;
    })
    .map((s) => Number(s.completion_rate) || 0)
    .filter((rate) => rate > 0);
  const completionRateThisMonth =
    completionRatesThisMonth.length > 0
      ? completionRatesThisMonth.reduce((sum, rate) => sum + rate, 0) /
        completionRatesThisMonth.length
      : 0;

  return {
    totalSessions,
    activeSessions,
    completedSessions,
    abandonedSessions,
    averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
    averageDuration: Math.round(averageDuration * 10) / 10,
    sessionsThisMonth,
    completionRateThisMonth: Math.round(completionRateThisMonth * 100) / 100,
  };
}

/**
 * Bulk export sessions as JSON
 */
export async function bulkExportSessionsJSON(sessionIds: string[]): Promise<string> {
  const sessions = await Promise.all(
    sessionIds.map(async (sessionId) => {
      const [session, messages, extractedFields, notes] = await Promise.all([
        getSession(sessionId),
        getMessages(sessionId),
        getExtractedFields(sessionId),
        getSessionNotes(sessionId),
      ]);

      return {
        session,
        messages,
        extractedFields,
        notes,
      };
    })
  );

  const exportData = {
    sessions,
    exportedAt: new Date().toISOString(),
    totalSessions: sessionIds.length,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Bulk export sessions as CSV
 */
export async function bulkExportSessionsCSV(sessionIds: string[]): Promise<string> {
  const csvRows: string[] = [];
  csvRows.push('Session ID,Status,Started At,Ended At,Completion Rate,Visitor ID,Required Fields,Completed Fields');

  for (const sessionId of sessionIds) {
    const session = await getSession(sessionId);
    if (!session) continue;

    const startedAt = session.started_at || '';
    const endedAt = session.ended_at || '';
    const completionRate = session.completion_rate || 0;
    const visitorId = session.visitor_id || '';
    const requiredFields = session.required_fields_count || 0;
    const completedFields = session.completed_fields_count || 0;

    csvRows.push(
      `${session.id},${session.status},"${startedAt}","${endedAt}",${completionRate},"${visitorId}",${requiredFields},${completedFields}`
    );
  }

  return csvRows.join('\n');
}

/**
 * Bulk delete sessions
 */
export async function bulkDeleteSessions(sessionIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .in('id', sessionIds);

  if (error) {
    throw new Error(`Failed to delete sessions: ${error.message}`);
  }
}

/**
 * Bulk mark sessions as reviewed (using tags)
 */
export async function bulkMarkSessionsReviewed(sessionIds: string[]): Promise<void> {
  // Get current sessions to preserve existing tags
  const { data: sessions, error: fetchError } = await supabase
    .from('sessions')
    .select('id, tags')
    .in('id', sessionIds);

  if (fetchError) {
    throw new Error(`Failed to fetch sessions: ${fetchError.message}`);
  }

  // Update each session to add 'reviewed' tag if not present
  const updatePromises = (sessions || []).map(async (session: { id: string; tags: string[] | null }) => {
    const currentTags = (session.tags as string[]) || [];
    const updatedTags = currentTags.includes('reviewed')
      ? currentTags
      : [...currentTags, 'reviewed'];

    const sessionsTable = supabase.from('sessions') as any;
    const { error } = await sessionsTable
      .update({ tags: updatedTags })
      .eq('id', session.id);

    if (error) {
      throw new Error(`Failed to update session ${session.id}: ${error.message}`);
    }
  });

  await Promise.all(updatePromises);
}
