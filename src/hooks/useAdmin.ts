import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as adminApi from '@/api/admin';

const QUERY_KEYS = {
  all: ['admin'] as const,
  kpis: () => [...QUERY_KEYS.all, 'kpis'] as const,
  sessionsOverTime: (days?: number) => [...QUERY_KEYS.all, 'sessions-over-time', days] as const,
  completionFunnel: () => [...QUERY_KEYS.all, 'completion-funnel'] as const,
  agentPerformance: () => [...QUERY_KEYS.all, 'agent-performance'] as const,
  teamMembers: () => [...QUERY_KEYS.all, 'team-members'] as const,
  systemHealth: () => [...QUERY_KEYS.all, 'system-health'] as const,
};

/**
 * Hook to fetch admin dashboard KPIs
 */
export function useAdminKPIs() {
  return useQuery({
    queryKey: QUERY_KEYS.kpis(),
    queryFn: () => adminApi.getAdminKPIs(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Hook to fetch sessions over time
 */
export function useSessionsOverTime(days: number = 30) {
  return useQuery({
    queryKey: QUERY_KEYS.sessionsOverTime(days),
    queryFn: () => adminApi.getSessionsOverTime(days),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch completion funnel data
 */
export function useCompletionFunnel() {
  return useQuery({
    queryKey: QUERY_KEYS.completionFunnel(),
    queryFn: () => adminApi.getCompletionFunnel(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch agent performance breakdown
 */
export function useAgentPerformance() {
  return useQuery({
    queryKey: QUERY_KEYS.agentPerformance(),
    queryFn: () => adminApi.getAgentPerformance(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch team members
 */
export function useTeamMembers() {
  return useQuery({
    queryKey: QUERY_KEYS.teamMembers(),
    queryFn: () => adminApi.getTeamMembers(),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to invite a team member
 */
export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (member: { email: string; role: 'admin' | 'member' | 'viewer' }) => 
      adminApi.inviteTeamMember(member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamMembers() });
      toast.success('Team member invited successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to invite team member: ${error.message}`);
    },
  });
}

/**
 * Hook to update team member role
 */
export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: 'admin' | 'member' | 'viewer' }) =>
      adminApi.updateTeamMemberRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamMembers() });
      toast.success('Team member role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update team member role: ${error.message}`);
    },
  });
}

/**
 * Hook to remove a team member
 */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => adminApi.removeTeamMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamMembers() });
      toast.success('Team member removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove team member: ${error.message}`);
    },
  });
}

/**
 * Hook to fetch system health metrics
 */
export function useSystemHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.systemHealth(),
    queryFn: () => adminApi.getSystemHealth(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
