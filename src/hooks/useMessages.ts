import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { getMessages, createMessage, subscribeToMessages } from '@/api/sessions';
import type { MessageInsert } from '@/types/database/session';

/**
 * Get messages for a session
 */
export function useMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ['messages', sessionId],
    queryFn: () => getMessages(sessionId!),
    enabled: !!sessionId,
  });
}

/**
 * Create a new message
 */
export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: MessageInsert) => createMessage(message),
    onSuccess: (data, variables) => {
      // Optimistically update the messages list
      queryClient.setQueryData<typeof data[]>(
        ['messages', variables.session_id],
        (old) => {
          if (!old) return [data];
          return [...old, data];
        }
      );
    },
  });
}

/**
 * Subscribe to real-time messages for a session
 */
export function useMessageSubscription(sessionId: string | null) {
  const queryClient = useQueryClient();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = subscribeToMessages(sessionId, (message) => {
      // Update the messages query with the new message
      queryClient.setQueryData<typeof message[]>(
        ['messages', sessionId],
        (old) => {
          if (!old) return [message];
          // Check if message already exists
          if (old.some((m) => m.id === message.id)) {
            return old;
          }
          return [...old, message];
        }
      );
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [sessionId, queryClient]);
}
