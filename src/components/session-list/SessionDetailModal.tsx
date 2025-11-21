import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  User,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useSession } from '@/hooks/useSessions';
import { Link } from 'react-router-dom';

interface SessionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string | null;
}

export function SessionDetailModal({
  open,
  onOpenChange,
  sessionId,
}: SessionDetailModalProps) {
  const { data: session, isLoading } = useSession(sessionId);

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const completionRate = session ? Number(session.completion_rate) || 0 : 0;
  const requiredFields = session?.required_fields_count || 0;
  const completedFields = session?.completed_fields_count || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Session Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !session ? (
          <div className="text-center py-8">
            <p className="text-muted">Session not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusBadge(session.status)}
                  {session.flagged && (
                    <Badge variant="outline" className="text-warning border-warning">
                      Flagged
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted font-mono">{session.id}</p>
              </div>
              <Link to={`/session/${session.id}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Viewer
                </Button>
              </Link>
            </div>

            {/* Visitor Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Visitor Information
              </h3>
              <div className="bg-surface rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Visitor ID:</span>
                  <span className="text-sm font-medium">
                    {session.visitor_id || 'Anonymous'}
                  </span>
                </div>
                {session.ip_address && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted">IP Address:</span>
                    <span className="text-sm font-medium">{session.ip_address}</span>
                  </div>
                )}
                {session.user_agent && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted">User Agent:</span>
                    <span className="text-sm font-medium truncate ml-4">
                      {session.user_agent}
                    </span>
                  </div>
                )}
                {session.referrer && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted">Referrer:</span>
                    <span className="text-sm font-medium truncate ml-4">
                      {session.referrer}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timestamps
              </h3>
              <div className="bg-surface rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Started:</span>
                  <span className="text-sm font-medium">{formatDate(session.started_at)}</span>
                </div>
                {session.ended_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted">Ended:</span>
                    <span className="text-sm font-medium">{formatDate(session.ended_at)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Created:</span>
                  <span className="text-sm font-medium">{formatDate(session.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Last Updated:</span>
                  <span className="text-sm font-medium">{formatDate(session.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Completion Metrics */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Completion Metrics
              </h3>
              <div className="bg-surface rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Completion Rate:</span>
                  <span className="text-sm font-semibold">{completionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-sm text-muted">Required Fields:</span>
                    <p className="text-sm font-semibold">{requiredFields}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted">Completed Fields:</span>
                    <p className="text-sm font-semibold">{completedFields}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {session.tags && session.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {session.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Flag Reason */}
            {session.flagged && session.flag_reason && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Flag Reason</h3>
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <p className="text-sm">{session.flag_reason}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {session && (
            <Link to={`/session/${session.id}`}>
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Session
              </Button>
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
