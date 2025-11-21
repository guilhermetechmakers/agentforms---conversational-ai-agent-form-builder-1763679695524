import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useWebhookHealth } from '@/hooks/useAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { WebhookHealth } from '@/api/analytics';

interface WebhookHealthTableProps {
  agentId?: string;
}

export function WebhookHealthTable({ agentId }: WebhookHealthTableProps) {
  const { data: health, isLoading } = useWebhookHealth(agentId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhook Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!health || health.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhook Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted">No webhooks configured</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {health.map((webhook) => (
            <WebhookHealthRow key={webhook.webhookId} webhook={webhook} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WebhookHealthRow({ webhook }: { webhook: WebhookHealth }) {
  const formatLastDelivery = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    switch (webhook.status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-danger" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (webhook.status) {
      case 'healthy':
        return <Badge variant="default" className="bg-success">Healthy</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-warning">Warning</Badge>;
      case 'critical':
        return <Badge variant="default" className="bg-danger">Critical</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {getStatusIcon()}
          <div className="font-medium">{webhook.webhookName}</div>
          {getStatusBadge()}
        </div>
        <div className="text-sm text-muted">
          {webhook.totalDeliveries} total • {webhook.successfulDeliveries} successful • {webhook.failedDeliveries} failed
        </div>
        <div className="text-xs text-muted mt-1">
          Last delivery: {formatLastDelivery(webhook.lastDeliveryAt)}
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-lg">{webhook.successRate}%</div>
        <div className="text-xs text-muted">success rate</div>
        <div className="text-xs text-muted mt-1">
          Avg: {webhook.averageResponseTime}ms
        </div>
      </div>
    </div>
  );
}
