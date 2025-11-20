import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatHeaderProps {
  agentName: string;
  avatarUrl?: string;
  logoUrl?: string;
  primaryColor?: string;
}

export function ChatHeader({ agentName, avatarUrl, logoUrl, primaryColor = '#4F46E5' }: ChatHeaderProps) {
  const initials = agentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3 shadow-soft"
      style={{ borderBottomColor: `${primaryColor}20` }}
    >
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${agentName} logo`}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={agentName} />
            <AvatarFallback
              className="text-sm font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1">
          <h2 className="text-h4 font-semibold text-foreground">{agentName}</h2>
          <p className="text-small text-muted-foreground">Online</p>
        </div>
      </div>
    </header>
  );
}
