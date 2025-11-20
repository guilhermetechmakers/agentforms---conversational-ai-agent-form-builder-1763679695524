import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSession, getSession, updateSession, getAgentBySlug } from '@/api/sessions';
import type { SessionInsert, SessionUpdate } from '@/types/database/session';

/**
 * Get agent by slug (public)
 */
export function usePublicAgent(slug: string) {
  return useQuery({
    queryKey: ['agent', 'public', slug],
    queryFn: () => getAgentBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get session by ID
 */
export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
  });
}

/**
 * Create a new session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (session: SessionInsert) => createSession(session),
    onSuccess: (data) => {
      queryClient.setQueryData(['session', data.id], data);
    },
  });
}

/**
 * Update session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, updates }: { sessionId: string; updates: SessionUpdate }) =>
      updateSession(sessionId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['session', data.id], data);
    },
  });
}
