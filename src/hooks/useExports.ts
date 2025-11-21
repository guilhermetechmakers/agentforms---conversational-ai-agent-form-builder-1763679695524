import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createExport,
  getExport,
  getExports,
  updateExport,
  deleteExport,
  markExportCompleted,
  markExportFailed,
  type GetExportsFilters,
} from '@/api/exports';
import type { ExportInsert, ExportUpdate } from '@/types/database/export';
import { toast } from 'sonner';

/**
 * Get export by ID
 */
export function useExport(exportId: string | null) {
  return useQuery({
    queryKey: ['export', exportId],
    queryFn: () => getExport(exportId!),
    enabled: !!exportId,
  });
}

/**
 * Get all exports with filters
 */
export function useExports(filters: GetExportsFilters = {}) {
  return useQuery({
    queryKey: ['exports', filters],
    queryFn: () => getExports(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Create a new export
 */
export function useCreateExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exportData: ExportInsert) => createExport(exportData),
    onSuccess: (data) => {
      queryClient.setQueryData(['export', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['exports'] });
    },
    onError: (error) => {
      toast.error(`Failed to create export: ${error.message}`);
    },
  });
}

/**
 * Update export
 */
export function useUpdateExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ exportId, updates }: { exportId: string; updates: ExportUpdate }) =>
      updateExport(exportId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['export', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['exports'] });
    },
    onError: (error) => {
      toast.error(`Failed to update export: ${error.message}`);
    },
  });
}

/**
 * Delete export
 */
export function useDeleteExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exportId: string) => deleteExport(exportId),
    onSuccess: (_, exportId) => {
      queryClient.removeQueries({ queryKey: ['export', exportId] });
      queryClient.invalidateQueries({ queryKey: ['exports'] });
      toast.success('Export deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete export: ${error.message}`);
    },
  });
}

/**
 * Mark export as completed
 */
export function useMarkExportCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      exportId,
      filePath,
      fileUrl,
      fileSizeBytes,
    }: {
      exportId: string;
      filePath?: string;
      fileUrl?: string;
      fileSizeBytes?: number;
    }) => markExportCompleted(exportId, filePath, fileUrl, fileSizeBytes),
    onSuccess: (data) => {
      queryClient.setQueryData(['export', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['exports'] });
    },
    onError: (error) => {
      toast.error(`Failed to mark export as completed: ${error.message}`);
    },
  });
}

/**
 * Mark export as failed
 */
export function useMarkExportFailed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      exportId,
      errorMessage,
      errorDetails,
    }: {
      exportId: string;
      errorMessage: string;
      errorDetails?: Record<string, any>;
    }) => markExportFailed(exportId, errorMessage, errorDetails),
    onSuccess: (data) => {
      queryClient.setQueryData(['export', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['exports'] });
    },
    onError: (error) => {
      toast.error(`Failed to mark export as failed: ${error.message}`);
    },
  });
}
