import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as webhooksApi from '@/api/webhooks';
import type { WebhookInsert, WebhookUpdate } from '@/types/database/webhook';

const QUERY_KEYS = {
  all: ['webhooks'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters?: { agentId?: string; enabled?: boolean }) => 
    [...QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
  deliveries: () => [...QUERY_KEYS.all, 'deliveries'] as const,
  webhookDeliveries: (webhookId: string, filters?: { status?: string; limit?: number }) => 
    [...QUERY_KEYS.deliveries(), webhookId, filters] as const,
};

/**
 * Hook to fetch all webhooks with optional filters
 */
export function useWebhooks(filters?: {
  agentId?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => webhooksApi.getWebhooks(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single webhook by ID
 */
export function useWebhook(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => webhooksApi.getWebhook(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch webhook delivery logs
 */
export function useWebhookDeliveries(
  webhookId: string,
  filters?: {
    status?: 'pending' | 'success' | 'failed' | 'retrying';
    limit?: number;
  }
) {
  return useQuery({
    queryKey: QUERY_KEYS.webhookDeliveries(webhookId, filters),
    queryFn: () => webhooksApi.getWebhookDeliveries(webhookId, filters),
    enabled: !!webhookId,
    staleTime: 10000, // 10 seconds - delivery logs change frequently
  });
}

/**
 * Hook to create a new webhook
 */
export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (webhook: WebhookInsert) => webhooksApi.createWebhook(webhook),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success('Webhook created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create webhook: ${error.message}`);
    },
  });
}

/**
 * Hook to update a webhook
 */
export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: WebhookUpdate }) =>
      webhooksApi.updateWebhook(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(data.id) });
      toast.success('Webhook updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update webhook: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a webhook
 */
export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhooksApi.deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success('Webhook deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete webhook: ${error.message}`);
    },
  });
}

/**
 * Hook to toggle webhook enabled status
 */
export function useToggleWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      webhooksApi.toggleWebhook(id, enabled),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(data.id) });
      toast.success(`Webhook ${data.enabled ? 'enabled' : 'disabled'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle webhook: ${error.message}`);
    },
  });
}

/**
 * Hook to test a webhook
 */
export function useTestWebhook() {
  return useMutation({
    mutationFn: (id: string) => webhooksApi.testWebhook(id),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(`Failed to test webhook: ${error.message}`);
    },
  });
}
