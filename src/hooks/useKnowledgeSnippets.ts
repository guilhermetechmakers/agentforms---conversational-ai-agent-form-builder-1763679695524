import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as knowledgeSnippetsApi from '@/api/knowledge-snippets';
import type { KnowledgeSnippetInsert, KnowledgeSnippetUpdate } from '@/types/database/knowledge-snippet';

const QUERY_KEYS = {
  all: ['knowledge-snippets'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (agentId: string) => [...QUERY_KEYS.lists(), agentId] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
};

/**
 * Hook to fetch all knowledge snippets for an agent
 */
export function useKnowledgeSnippets(agentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.list(agentId),
    queryFn: () => knowledgeSnippetsApi.getKnowledgeSnippets(agentId),
    enabled: !!agentId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single knowledge snippet by ID
 */
export function useKnowledgeSnippet(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => knowledgeSnippetsApi.getKnowledgeSnippet(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Hook to create a new knowledge snippet
 */
export function useCreateKnowledgeSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (snippet: KnowledgeSnippetInsert) => knowledgeSnippetsApi.createKnowledgeSnippet(snippet),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list(data.agent_id) });
      toast.success('Knowledge snippet created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create knowledge snippet: ${error.message}`);
    },
  });
}

/**
 * Hook to update a knowledge snippet
 */
export function useUpdateKnowledgeSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: KnowledgeSnippetUpdate }) =>
      knowledgeSnippetsApi.updateKnowledgeSnippet(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list(data.agent_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(data.id) });
      toast.success('Knowledge snippet updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update knowledge snippet: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a knowledge snippet
 */
export function useDeleteKnowledgeSnippet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; agentId: string }) =>
      knowledgeSnippetsApi.deleteKnowledgeSnippet(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list(variables.agentId) });
      toast.success('Knowledge snippet deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete knowledge snippet: ${error.message}`);
    },
  });
}

/**
 * Hook to reorder knowledge snippets
 */
export function useReorderKnowledgeSnippets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, snippetIds }: { agentId: string; snippetIds: string[] }) =>
      knowledgeSnippetsApi.reorderKnowledgeSnippets(agentId, snippetIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list(variables.agentId) });
      toast.success('Knowledge snippets reordered successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder knowledge snippets: ${error.message}`);
    },
  });
}
