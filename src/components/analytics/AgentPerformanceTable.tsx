import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgentPerformance } from '@/hooks/useAnalytics';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import type { AgentPerformance } from '@/api/analytics';

interface AgentPerformanceTableProps {
  agentId?: string;
  limit?: number;
}

export function AgentPerformanceTable({ agentId, limit }: AgentPerformanceTableProps) {
  const { data: performance, isLoading } = useAgentPerformance(agentId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
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

  if (!performance || performance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted">No performance data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayData = limit ? performance.slice(0, limit) : performance;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayData.map((agent) => (
            <AgentPerformanceRow key={agent.agentId} agent={agent} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AgentPerformanceRow({ agent }: { agent: AgentPerformance }) {
  const formatLastActivity = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-medium">{agent.agentName}</div>
          <Link
            to={`/agent/${agent.agentId}/sessions`}
            className="text-muted hover:text-primary transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
        <div className="text-sm text-muted">
          {agent.totalSessions} sessions • {agent.completedSessions} completed • {agent.abandonedSessions} abandoned
        </div>
        <div className="text-xs text-muted mt-1">
          Last activity: {formatLastActivity(agent.lastActivity)}
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-lg">{agent.completionRate}%</div>
        <div className="text-xs text-muted">completion rate</div>
        <div className="text-xs text-muted mt-1">
          Avg: {agent.averageDuration} min
        </div>
      </div>
    </div>
  );
}
