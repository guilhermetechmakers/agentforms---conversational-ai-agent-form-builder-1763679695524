import { supabase } from '@/lib/supabase';
import type { SupportTicket, SupportTicketInsert, SupportTicketUpdate } from '@/types/database/support-ticket';

/**
 * Create a new support ticket
 */
export async function createSupportTicket(input: SupportTicketInsert): Promise<SupportTicket> {
  const { data, error } = await supabase
    .from('support_tickets')
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
 * Get support tickets for the current user (or all if admin)
 */
export async function getSupportTickets(limit = 50): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Get a single support ticket by ID
 */
export async function getSupportTicket(id: string): Promise<SupportTicket> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update a support ticket
 */
export async function updateSupportTicket(
  id: string,
  updates: SupportTicketUpdate
): Promise<SupportTicket> {
  const { data, error } = await supabase
    .from('support_tickets')
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
 * Get support tickets by status
 */
export async function getSupportTicketsByStatus(
  status: SupportTicket['status'],
  limit = 50
): Promise<SupportTicket[]> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
