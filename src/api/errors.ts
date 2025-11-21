import { supabase } from '@/lib/supabase';
import type { ErrorLog, ErrorLogInsert, ErrorLogUpdate } from '@/types/database/error-log';
import type { SupportTicket, SupportTicketInsert } from '@/types/database/support-ticket';

/**
 * Log an error to the database
 */
export async function logError(input: ErrorLogInsert): Promise<ErrorLog> {
  const { data, error } = await supabase
    .from('error_logs')
    // @ts-expect-error - Supabase type inference issue with Database type
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get error logs for the current user (or all if admin)
 */
export async function getErrorLogs(limit = 50): Promise<ErrorLog[]> {
  const { data, error } = await supabase
    .from('error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Get a single error log by ID
 */
export async function getErrorLog(id: string): Promise<ErrorLog> {
  const { data, error } = await supabase
    .from('error_logs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update an error log (e.g., to link a support ticket)
 */
export async function updateErrorLog(
  id: string,
  updates: ErrorLogUpdate
): Promise<ErrorLog> {
  const { data, error } = await supabase
    .from('error_logs')
    // @ts-expect-error - Supabase type inference issue with Database type
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create a support ticket from an error
 */
export async function createSupportTicketFromError(
  errorLogId: string,
  ticketData: Omit<SupportTicketInsert, 'error_log_id'>
): Promise<{ ticket: SupportTicket; errorLog: ErrorLog }> {
  // Create the support ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    // @ts-expect-error - Supabase type inference issue with Database type
    .insert({
      ...ticketData,
      error_log_id: errorLogId,
    })
    .select()
    .single();

  if (ticketError) {
    throw new Error(ticketError.message);
  }

  // Update the error log to reference the ticket
  const { data: errorLog, error: errorLogError } = await supabase
    .from('error_logs')
    // @ts-expect-error - Supabase type inference issue with Database type
    .update({ support_ticket_id: ticket.id })
    .eq('id', errorLogId)
    .select()
    .single();

  if (errorLogError) {
    throw new Error(errorLogError.message);
  }

  return { ticket, errorLog };
}

/**
 * Helper function to automatically log a 404 error
 */
export async function log404Error(url: string, userAgent?: string): Promise<ErrorLog> {
  const { data: { user } } = await supabase.auth.getUser();
  
  return logError({
    error_type: '404',
    url_attempted: url,
    user_id: user?.id || null,
    user_agent: userAgent || navigator.userAgent,
    http_method: 'GET',
    status_code: 404,
    error_message: 'Page not found',
    additional_info: {
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Helper function to automatically log a 500 error
 */
export async function log500Error(
  url: string,
  errorMessage: string,
  stackTrace?: string,
  userAgent?: string
): Promise<ErrorLog> {
  const { data: { user } } = await supabase.auth.getUser();
  
  return logError({
    error_type: '500',
    url_attempted: url,
    user_id: user?.id || null,
    user_agent: userAgent || navigator.userAgent,
    http_method: 'GET',
    status_code: 500,
    error_message: errorMessage,
    stack_trace: stackTrace,
    additional_info: {
      timestamp: new Date().toISOString(),
    },
  });
}
