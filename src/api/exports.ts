import { supabase } from '@/lib/supabase';
import type { ExportRow, ExportInsert, ExportUpdate } from '@/types/database/export';

/**
 * Create a new export record
 */
export async function createExport(exportData: ExportInsert): Promise<ExportRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const exportsTable = supabase.from('exports') as any;
  const { data, error } = await exportsTable
    .insert({
      ...exportData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create export: ${error.message}`);
  }

  return data as ExportRow;
}

/**
 * Get export by ID
 */
export async function getExport(exportId: string): Promise<ExportRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('exports')
    .select('*')
    .eq('id', exportId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch export: ${error.message}`);
  }

  return data as ExportRow;
}

/**
 * Get all exports for the current user
 */
export interface GetExportsFilters {
  agentId?: string;
  format?: 'json' | 'csv';
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  page?: number;
  pageSize?: number;
}

export interface GetExportsResult {
  exports: ExportRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getExports(
  filters: GetExportsFilters = {}
): Promise<GetExportsResult> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const {
    agentId,
    format,
    status,
    page = 1,
    pageSize = 20,
  } = filters;

  let query = supabase
    .from('exports')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  // Apply filters
  if (agentId) {
    query = query.eq('agent_id', agentId);
  }

  if (format) {
    query = query.eq('format', format);
  }

  if (status) {
    query = query.eq('status', status);
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Order by most recent first
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch exports: ${error.message}`);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    exports: (data || []) as ExportRow[],
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Update export
 */
export async function updateExport(
  exportId: string,
  updates: ExportUpdate
): Promise<ExportRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const exportsTable = supabase.from('exports') as any;
  const { data, error } = await exportsTable
    .update(updates)
    .eq('id', exportId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update export: ${error.message}`);
  }

  return data as ExportRow;
}

/**
 * Delete export
 */
export async function deleteExport(exportId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('exports')
    .delete()
    .eq('id', exportId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete export: ${error.message}`);
  }
}

/**
 * Mark export as completed
 */
export async function markExportCompleted(
  exportId: string,
  filePath?: string | null,
  fileUrl?: string | null,
  fileSizeBytes?: number | null
): Promise<ExportRow> {
  return updateExport(exportId, {
    status: 'completed',
    file_path: filePath ?? null,
    file_url: fileUrl ?? null,
    file_size_bytes: fileSizeBytes ?? null,
    completed_at: new Date().toISOString(),
  });
}

/**
 * Mark export as failed
 */
export async function markExportFailed(
  exportId: string,
  errorMessage: string,
  errorDetails?: Record<string, any>
): Promise<ExportRow> {
  return updateExport(exportId, {
    status: 'failed',
    error_message: errorMessage,
    error_details: errorDetails || null,
    completed_at: new Date().toISOString(),
  });
}
