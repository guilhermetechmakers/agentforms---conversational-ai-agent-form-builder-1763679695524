import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageBubbleProps {
  role: 'agent' | 'visitor' | 'system';
  content: string;
  timestamp: string;
  avatarUrl?: string;
  agentName?: string;
  primaryColor?: string;
  validationState?: string | null;
  validationErrors?: Record<string, any> | null;
}

export function MessageBubble({
  role,
  content,
  timestamp,
  avatarUrl,
  agentName = 'Agent',
  primaryColor = '#4F46E5',
  validationState,
  validationErrors,
}: MessageBubbleProps) {
  const isAgent = role === 'agent';
  const isSystem = role === 'system';
  const isInvalid = validationState === 'invalid';

  const initials = agentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isSystem) {
    return (
      <div className="flex justify-center px-4 py-2">
        <span className="text-small text-muted-foreground italic">{content}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 animate-fade-in',
        isAgent ? 'justify-start' : 'justify-end'
      )}
    >
      {isAgent && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={avatarUrl} alt={agentName} />
          <AvatarFallback
            className="text-xs font-semibold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn('flex flex-col gap-1 max-w-[75%]', isAgent ? 'items-start' : 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 shadow-soft',
            isAgent
              ? 'bg-surface text-foreground rounded-tl-sm'
              : 'text-white rounded-tr-sm',
            isInvalid && 'border-2 border-danger'
          )}
          style={
            !isAgent
              ? {
                  backgroundColor: primaryColor,
                }
              : undefined
          }
        >
          <p className="text-body whitespace-pre-wrap break-words">{content}</p>
        </div>

        {isInvalid && validationErrors && (
          <div className="text-small text-danger px-2">
            {typeof validationErrors === 'object' && 'message' in validationErrors
              ? String(validationErrors.message)
              : 'Invalid input. Please try again.'}
          </div>
        )}

        <span className="text-small text-muted-foreground px-1">
          {format(new Date(timestamp), 'h:mm a')}
        </span>
      </div>

      {!isAgent && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary text-white text-xs">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
