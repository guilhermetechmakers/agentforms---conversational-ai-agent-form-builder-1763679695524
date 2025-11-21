import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useSystemHealth } from '@/hooks/useAdmin';
import { formatDistanceToNow } from 'date-fns';

export function SystemHealth() {
  const { data: health, isLoading } = useSystemHealth();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  const llmSuccessRate = health.llmUsage.totalRequests > 0
    ? Math.round((health.llmUsage.successfulRequests / health.llmUsage.totalRequests) * 100)
    : 0;

  const rateLimitUsage = Math.round((health.rateLimits.current / health.rateLimits.limit) * 100);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">System Health</h3>
        <p className="text-sm text-muted">Monitor system performance and usage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* LLM Usage */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">LLM API Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Total Requests</span>
                <span className="text-lg font-bold">{health.llmUsage.totalRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Success Rate</span>
                <Badge variant={llmSuccessRate >= 95 ? 'default' : llmSuccessRate >= 80 ? 'secondary' : 'destructive'}>
                  {llmSuccessRate}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Avg Latency</span>
                <span className="text-sm font-medium">
                  {health.llmUsage.averageLatency > 0
                    ? `${Math.round(health.llmUsage.averageLatency)}ms`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rate Limits</CardTitle>
            <Clock className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Usage</span>
                <span className="text-lg font-bold">
                  {health.rateLimits.current} / {health.rateLimits.limit}
                </span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    rateLimitUsage >= 90
                      ? 'bg-danger'
                      : rateLimitUsage >= 70
                      ? 'bg-warning'
                      : 'bg-success'
                  }`}
                  style={{ width: `${Math.min(rateLimitUsage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Resets</span>
                <span className="text-xs text-muted">
                  {formatDistanceToNow(new Date(health.rateLimits.resetAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Queue */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivery Queue</CardTitle>
            <Activity className="h-4 w-4 text-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Pending
                </span>
                <span className="text-lg font-bold">{health.deliveryQueue.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Processing
                </span>
                <span className="text-lg font-bold">{health.deliveryQueue.processing}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted flex items-center gap-1">
                  {health.deliveryQueue.failed > 0 ? (
                    <XCircle className="h-3 w-3 text-danger" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  )}
                  Failed
                </span>
                <Badge variant={health.deliveryQueue.failed > 0 ? 'destructive' : 'default'}>
                  {health.deliveryQueue.failed}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
