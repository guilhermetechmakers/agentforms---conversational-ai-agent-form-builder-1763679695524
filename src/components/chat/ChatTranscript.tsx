import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { MessageRow } from '@/types/database/session';

interface ChatTranscriptProps {
  messages: MessageRow[];
  isTyping?: boolean;
  agentName: string;
  avatarUrl?: string;
  primaryColor?: string;
}

export function ChatTranscript({
  messages,
  isTyping = false,
  agentName,
  avatarUrl,
  primaryColor = '#4F46E5',
}: ChatTranscriptProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-0">
      <div className="min-h-full flex flex-col py-4">
        {messages.length === 0 && !isTyping && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-center px-4">
              Start a conversation with {agentName}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.created_at}
            avatarUrl={avatarUrl}
            agentName={agentName}
            primaryColor={primaryColor}
            validationState={message.validation_state}
            validationErrors={message.validation_errors}
          />
        ))}

        {isTyping && (
          <TypingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
