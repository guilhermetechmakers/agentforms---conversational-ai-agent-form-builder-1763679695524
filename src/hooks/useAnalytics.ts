import { useQuery } from '@tanstack/react-query';
import * as analyticsApi from '@/api/analytics';

const QUERY_KEYS = {
  all: ['analytics'] as const,
  kpis: (agentId?: string) => [...QUERY_KEYS.all, 'kpis', agentId] as const,
  sessionsOverTime: (days: 7 | 30 | 90, agentId?: string) => 
    [...QUERY_KEYS.all, 'sessionsOverTime', days, agentId] as const,
  completionFunnel: (agentId?: string) => 
    [...QUERY_KEYS.all, 'completionFunnel', agentId] as const,
  agentPerformance: (agentId?: string) => 
    [...QUERY_KEYS.all, 'agentPerformance', agentId] as const,
  webhookHealth: (agentId?: string) => 
    [...QUERY_KEYS.all, 'webhookHealth', agentId] as const,
  usageMetrics: (agentId?: string) => 
    [...QUERY_KEYS.all, 'usageMetrics', agentId] as const,
};

/**
 * Hook to fetch analytics KPIs
 */
export function useAnalyticsKPIs(agentId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.kpis(agentId),
    queryFn: () => analyticsApi.getAnalyticsKPIs(agentId),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch sessions over time
 */
export function useSessionsOverTime(
  days: 7 | 30 | 90 = 30,
  agentId?: string
) {
  return useQuery({
    queryKey: QUERY_KEYS.sessionsOverTime(days, agentId),
    queryFn: () => analyticsApi.getSessionsOverTime(days, agentId),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch completion funnel data
 */
export function useCompletionFunnel(agentId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.completionFunnel(agentId),
    queryFn: () => analyticsApi.getCompletionFunnel(agentId),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch agent performance breakdown
 */
export function useAgentPerformance(agentId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.agentPerformance(agentId),
    queryFn: () => analyticsApi.getAgentPerformance(agentId),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch webhook health metrics
 */
export function useWebhookHealth(agentId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.webhookHealth(agentId),
    queryFn: () => analyticsApi.getWebhookHealth(agentId),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch usage metrics
 */
export function useUsageMetrics(agentId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.usageMetrics(agentId),
    queryFn: () => analyticsApi.getUsageMetrics(agentId),
    staleTime: 60000, // 1 minute
  });
}
