import { Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Download,
  Send,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flag,
  User,
} from 'lucide-react';
import type { SessionRow as SessionRowType } from '@/types/database/session';

interface SessionRowProps {
  session: SessionRowType;
  isSelected: boolean;
  onSelect: (sessionId: string, selected: boolean) => void;
  onView: (sessionId: string) => void;
  onExport: (sessionId: string) => void;
  onRetryWebhook?: (sessionId: string) => void;
}

export function SessionRow({
  session,
  isSelected,
  onSelect,
  onView,
  onExport,
  onRetryWebhook,
}: SessionRowProps) {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-success text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="default" className="bg-primary text-white">
            <Clock className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'abandoned':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Abandoned
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimestamp = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  const formatFullDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const completionRate = Number(session.completion_rate) || 0;
  const requiredFields = session.required_fields_count || 0;
  const completedFields = session.completed_fields_count || 0;

  // Get transcript snippet (would need to fetch messages, for now show placeholder)
  const transcriptSnippet = 'Session in progress...';

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(session.id, checked as boolean)}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {session.visitor_id ? (
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted" />
                        {session.visitor_id}
                      </span>
                    ) : (
                      <span className="text-muted">Anonymous Visitor</span>
                    )}
                  </h3>
                  {session.flagged && (
                    <span title="Flagged">
                      <Flag className="h-4 w-4 text-warning" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted mb-2 truncate">{transcriptSnippet}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {getStatusBadge(session.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(session.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/session/${session.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Open in Viewer
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onExport(session.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </DropdownMenuItem>
                    {onRetryWebhook && (
                      <DropdownMenuItem onClick={() => onRetryWebhook(session.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Retry Webhook
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted">Started:</span>
                <p className="font-medium">{formatTimestamp(session.started_at)}</p>
                <p className="text-xs text-muted">{formatFullDate(session.started_at)}</p>
              </div>
              {session.ended_at && (
                <div>
                  <span className="text-muted">Ended:</span>
                  <p className="font-medium">{formatTimestamp(session.ended_at)}</p>
                  <p className="text-xs text-muted">{formatFullDate(session.ended_at)}</p>
                </div>
              )}
              <div>
                <span className="text-muted">Completion:</span>
                <p className="font-medium">
                  {completionRate.toFixed(0)}% ({completedFields}/{requiredFields})
                </p>
                <div className="w-full bg-surface rounded-full h-1.5 mt-1">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              {session.tags && session.tags.length > 0 && (
                <div>
                  <span className="text-muted">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {session.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {session.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{session.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
