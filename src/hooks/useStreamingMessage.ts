/**
 * Hook for streaming LLM responses
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { generateStreamingAgentResponse } from '@/api/llm';
import type { ConversationContext } from '@/api/llm';
import type { MessageRow } from '@/types/database/session';

interface UseStreamingMessageOptions {
  sessionId: string;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
}

export function useStreamingMessage(options: UseStreamingMessageOptions) {
  const { sessionId, onComplete, onError } = options;
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStreaming = useCallback(
    async (context: ConversationContext, userMessage: string) => {
      if (isStreaming) {
        console.warn('Streaming already in progress');
        return;
      }

      setIsStreaming(true);
      setStreamingContent('');
      abortControllerRef.current = new AbortController();

      try {
        const generator = generateStreamingAgentResponse(context, userMessage);

        for await (const chunk of generator) {
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          setStreamingContent(chunk.content);

          if (chunk.done) {
            // Create the final message
            const finalMessage: MessageRow = {
              id: `temp-${Date.now()}`,
              session_id: sessionId,
              role: 'agent',
              content: chunk.content,
              metadata: chunk.extractedFields
                ? { extractedFields: chunk.extractedFields }
                : {},
              validation_state: null,
              validation_errors: null,
              created_at: new Date().toISOString(),
            };

            // Update messages query
            queryClient.setQueryData<MessageRow[]>(
              ['messages', sessionId],
              (old) => {
                if (!old) return [finalMessage];
                // Remove any temporary streaming message
                const filtered = old.filter(
                  (m) => !m.id.startsWith('temp-') || m.id === finalMessage.id
                );
                return [...filtered, finalMessage];
              }
            );

            onComplete?.(chunk.content);
            setIsStreaming(false);
            setStreamingContent('');
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Streaming error:', error);
          onError?.(error as Error);
        }
        setIsStreaming(false);
        setStreamingContent('');
      }
    },
    [sessionId, isStreaming, onComplete, onError, queryClient]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStreamingContent('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, [stopStreaming]);

  return {
    isStreaming,
    streamingContent,
    startStreaming,
    stopStreaming,
  };
}
