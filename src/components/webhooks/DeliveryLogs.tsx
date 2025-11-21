import { useState } from 'react';
import { useWebhookDeliveries } from '@/hooks/useWebhooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface DeliveryLogsProps {
  webhookId: string;
}

export function DeliveryLogs({ webhookId }: DeliveryLogsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: deliveries, isLoading } = useWebhookDeliveries(webhookId, {
    limit: 50,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-success text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-danger text-white">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'retrying':
        return (
          <Badge className="bg-warning text-white">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retrying
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Delivery Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No delivery logs yet. Logs will appear here after webhook events are triggered.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-surface transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Delivery Logs ({deliveries.length})
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-3">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="border border-border rounded-lg p-4 space-y-3 hover:bg-surface transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(delivery.status)}
                      <span className="text-sm text-muted-foreground">
                        Attempt {delivery.attempt_number} of {delivery.max_attempts}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(delivery.started_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">URL:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-surface px-2 py-1 rounded truncate max-w-md">
                          {delivery.request_url}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(delivery.request_url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Method:</span>
                      <div className="mt-1">
                        <Badge variant="outline">{delivery.request_method}</Badge>
                      </div>
                    </div>
                  </div>

                  {delivery.response_status && (
                    <div>
                      <span className="text-sm text-muted-foreground">Response:</span>
                      <div className="mt-1">
                        <Badge
                          variant="outline"
                          className={
                            delivery.response_status >= 200 &&
                            delivery.response_status < 300
                              ? 'border-success text-success'
                              : 'border-danger text-danger'
                          }
                        >
                          {delivery.response_status}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {delivery.error_message && (
                    <div>
                      <span className="text-sm text-muted-foreground">Error:</span>
                      <p className="text-sm text-danger mt-1">{delivery.error_message}</p>
                    </div>
                  )}

                  {delivery.duration_ms && (
                    <div>
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <span className="text-sm ml-2">{delivery.duration_ms}ms</span>
                    </div>
                  )}

                  {delivery.request_body && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View Request Body
                      </summary>
                      <pre className="mt-2 p-3 bg-surface rounded text-xs overflow-x-auto">
                        {JSON.stringify(delivery.request_body, null, 2)}
                      </pre>
                    </details>
                  )}

                  {delivery.response_body && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View Response Body
                      </summary>
                      <pre className="mt-2 p-3 bg-surface rounded text-xs overflow-x-auto">
                        {delivery.response_body}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
