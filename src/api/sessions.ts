import { supabase } from '@/lib/supabase';
import type { SessionRow, SessionInsert, SessionUpdate, MessageRow, MessageInsert, ExtractedFieldRow } from '@/types/database/session';

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
