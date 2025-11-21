import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as supportApi from '@/api/support';
import type { SupportTicket, SupportTicketInsert, SupportTicketUpdate } from '@/types/database/support-ticket';

// Query keys
export const supportKeys = {
  all: ['support'] as const,
  lists: () => [...supportKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...supportKeys.lists(), filters] as const,
  details: () => [...supportKeys.all, 'detail'] as const,
  detail: (id: string) => [...supportKeys.details(), id] as const,
  byStatus: (status: SupportTicket['status']) => [...supportKeys.all, 'status', status] as const,
};

/**
 * Get support tickets
 */
export function useSupportTickets(limit = 50) {
  return useQuery({
    queryKey: supportKeys.list({ limit }),
    queryFn: () => supportApi.getSupportTickets(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get support tickets by status
 */
export function useSupportTicketsByStatus(status: SupportTicket['status'], limit = 50) {
  return useQuery({
    queryKey: supportKeys.byStatus(status),
    queryFn: () => supportApi.getSupportTicketsByStatus(status, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get a single support ticket
 */
export function useSupportTicket(id: string | undefined) {
  return useQuery({
    queryKey: supportKeys.detail(id || ''),
    queryFn: () => supportApi.getSupportTicket(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create support ticket mutation
 */
export function useCreateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SupportTicketInsert) => supportApi.createSupportTicket(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.lists() });
      toast.success('Support ticket created successfully! We\'ll get back to you soon.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create support ticket. Please try again.');
    },
  });
}

/**
 * Update support ticket mutation
 */
export function useUpdateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SupportTicketUpdate }) =>
      supportApi.updateSupportTicket(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: supportKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: supportKeys.lists() });
      toast.success('Support ticket updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update support ticket.');
    },
  });
}
