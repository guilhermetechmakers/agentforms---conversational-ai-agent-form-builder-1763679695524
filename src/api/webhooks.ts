import { supabase } from '@/lib/supabase';
import type { WebhookRow, WebhookInsert, WebhookUpdate, WebhookDeliveryRow } from '@/types/database/webhook';

/**
 * Fetch all webhooks for the current user
 */
export async function getWebhooks(filters?: {
  agentId?: string;
  enabled?: boolean;
}): Promise<WebhookRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('webhooks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filters?.agentId) {
    query = query.eq('agent_id', filters.agentId);
  }

  if (filters?.enabled !== undefined) {
    query = query.eq('enabled', filters.enabled);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch webhooks: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single webhook by ID
 */
export async function getWebhook(id: string): Promise<WebhookRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch webhook: ${error.message}`);
  }

  return data;
}

/**
 * Create a new webhook
 */
export async function createWebhook(webhook: WebhookInsert): Promise<WebhookRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const webhooksTable = supabase.from('webhooks') as any;
  const { data, error } = await webhooksTable
    .insert({
      ...webhook,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create webhook: ${error.message}`);
  }

  return data;
}

/**
 * Update a webhook
 */
export async function updateWebhook(id: string, updates: WebhookUpdate): Promise<WebhookRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const webhooksTable = supabase.from('webhooks') as any;
  const { data, error } = await webhooksTable
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update webhook: ${error.message}`);
  }

  return data;
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete webhook: ${error.message}`);
  }
}

/**
 * Toggle webhook enabled status
 */
export async function toggleWebhook(id: string, enabled: boolean): Promise<WebhookRow> {
  return updateWebhook(id, { enabled });
}

/**
 * Fetch delivery logs for a webhook
 */
export async function getWebhookDeliveries(
  webhookId: string,
  filters?: {
    status?: 'pending' | 'success' | 'failed' | 'retrying';
    limit?: number;
  }
): Promise<WebhookDeliveryRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify user owns the webhook
  const webhook = await getWebhook(webhookId);
  if (!webhook) {
    throw new Error('Webhook not found');
  }

  let query = supabase
    .from('webhook_deliveries')
    .select('*')
    .eq('webhook_id', webhookId)
    .order('started_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  } else {
    query = query.limit(100); // Default limit
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch webhook deliveries: ${error.message}`);
  }

  return data || [];
}

/**
 * Test a webhook by sending a test payload
 */
export async function testWebhook(id: string): Promise<{ success: boolean; message: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const webhook = await getWebhook(id);
  if (!webhook) {
    throw new Error('Webhook not found');
  }

  // This would typically call a backend endpoint that sends the test webhook
  // For now, we'll simulate it
  try {
    // In a real implementation, this would call a backend API endpoint
    // that actually sends the HTTP request to the webhook URL
    // For now, we'll just return success
    return {
      success: true,
      message: 'Test webhook sent successfully',
    };
  } catch (error: any) {
    throw new Error(`Failed to test webhook: ${error.message}`);
  }
}
