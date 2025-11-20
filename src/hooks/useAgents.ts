import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as agentsApi from '@/api/agents';
import type { AgentInsert, AgentUpdate } from '@/types/database/agent';

const QUERY_KEYS = {
  all: ['agents'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters?: { status?: string; search?: string; tags?: string[] }) => 
    [...QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUERY_KEYS.details(), id] as const,
  usage: () => [...QUERY_KEYS.all, 'usage'] as const,
  usageStats: (agentId?: string) => [...QUERY_KEYS.usage(), agentId] as const,
};

/**
 * Hook to fetch all agents with optional filters
 */
export function useAgents(filters?: {
  status?: 'draft' | 'published' | 'archived';
  search?: string;
  tags?: string[];
}) {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => agentsApi.getAgents(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single agent by ID
 */
export function useAgent(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id),
    queryFn: () => agentsApi.getAgent(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch agent usage statistics
 */
export function useAgentUsageStats(agentId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.usageStats(agentId),
    queryFn: () => agentsApi.getAgentUsageStats(agentId),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to create a new agent
 */
export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agent: AgentInsert) => agentsApi.createAgent(agent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.usage() });
      toast.success('Agent created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create agent: ${error.message}`);
    },
  });
}

/**
 * Hook to update an agent
 */
export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: AgentUpdate }) =>
      agentsApi.updateAgent(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.usage() });
      toast.success('Agent updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update agent: ${error.message}`);
    },
  });
}

/**
 * Hook to delete an agent
 */
export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => agentsApi.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.usage() });
      toast.success('Agent deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete agent: ${error.message}`);
    },
  });
}

/**
 * Hook to duplicate an agent
 */
export function useDuplicateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => agentsApi.duplicateAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() });
      toast.success('Agent duplicated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate agent: ${error.message}`);
    },
  });
}
