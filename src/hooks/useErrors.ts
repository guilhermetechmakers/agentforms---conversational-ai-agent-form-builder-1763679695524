import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as errorsApi from '@/api/errors';
import type { ErrorLogInsert } from '@/types/database/error-log';
import type { SupportTicketInsert } from '@/types/database/support-ticket';

// Query keys
export const errorKeys = {
  all: ['errors'] as const,
  lists: () => [...errorKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...errorKeys.lists(), filters] as const,
  details: () => [...errorKeys.all, 'detail'] as const,
  detail: (id: string) => [...errorKeys.details(), id] as const,
};

/**
 * Get error logs
 */
export function useErrorLogs(limit = 50) {
  return useQuery({
    queryKey: errorKeys.list({ limit }),
    queryFn: () => errorsApi.getErrorLogs(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get a single error log
 */
export function useErrorLog(id: string | undefined) {
  return useQuery({
    queryKey: errorKeys.detail(id || ''),
    queryFn: () => errorsApi.getErrorLog(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Log an error mutation
 */
export function useLogError() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ErrorLogInsert) => errorsApi.logError(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: errorKeys.lists() });
    },
    onError: (error: Error) => {
      // Silently fail - we don't want to show errors when logging errors
      console.error('Failed to log error:', error);
    },
  });
}

/**
 * Log a 404 error mutation
 */
export function useLog404Error() {
  return useMutation({
    mutationFn: ({ url, userAgent }: { url: string; userAgent?: string }) =>
      errorsApi.log404Error(url, userAgent),
    onError: (error: Error) => {
      // Silently fail - we don't want to show errors when logging errors
      console.error('Failed to log 404 error:', error);
    },
  });
}

/**
 * Log a 500 error mutation
 */
export function useLog500Error() {
  return useMutation({
    mutationFn: ({
      url,
      errorMessage,
      stackTrace,
      userAgent,
    }: {
      url: string;
      errorMessage: string;
      stackTrace?: string;
      userAgent?: string;
    }) => errorsApi.log500Error(url, errorMessage, stackTrace, userAgent),
    onError: (error: Error) => {
      // Silently fail - we don't want to show errors when logging errors
      console.error('Failed to log 500 error:', error);
    },
  });
}

/**
 * Create support ticket from error mutation
 */
export function useCreateSupportTicketFromError() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      errorLogId,
      ticketData,
    }: {
      errorLogId: string;
      ticketData: Omit<SupportTicketInsert, 'error_log_id'>;
    }) => errorsApi.createSupportTicketFromError(errorLogId, ticketData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: errorKeys.all });
      toast.success('Support ticket created successfully! We\'ll get back to you soon.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create support ticket. Please try again.');
    },
  });
}
