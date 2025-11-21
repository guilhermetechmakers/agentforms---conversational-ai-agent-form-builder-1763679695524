import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KPICard } from '@/components/admin/KPICard';
import { AgentPerformanceTable } from '@/components/analytics/AgentPerformanceTable';
import { WebhookHealthTable } from '@/components/analytics/WebhookHealthTable';
import { ExportAnalyticsDialog } from '@/components/analytics/ExportAnalyticsDialog';
import {
  useAnalyticsKPIs,
  useSessionsOverTime,
  useCompletionFunnel,
  useUsageMetrics,
} from '@/hooks/useAnalytics';
import { useAgents } from '@/hooks/useAgents';
import {
  Users,
  MessageSquare,
  TrendingUp,
  Webhook,
  BarChart3,
  Download,
  Activity,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Fetch agents for filter dropdown
  const { data: agents } = useAgents();

  // Fetch analytics data
  const { data: kpis, isLoading: kpisLoading } = useAnalyticsKPIs(selectedAgentId);
  const { data: sessionsOverTime, isLoading: sessionsLoading } = useSessionsOverTime(timeRange, selectedAgentId);
  const { data: completionFunnel, isLoading: funnelLoading } = useCompletionFunnel(selectedAgentId);
  const { data: usageMetrics, isLoading: usageLoading } = useUsageMetrics(selectedAgentId);

  // Format sessions over time data for chart
  const chartData = sessionsOverTime?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sessions: item.sessions,
    completed: item.completed,
    abandoned: item.abandoned,
  })) || [];

  // Format completion funnel data
  const funnelData = completionFunnel || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-h2">Analytics Dashboard</h1>
            <p className="text-muted mt-1">
              Monitor agent performance, session statistics, and system health
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedAgentId || 'all'}
              onValueChange={(value) => setSelectedAgentId(value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents?.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Active Agents"
            value={kpis?.activeAgents || 0}
            subtitle={`${kpis?.activeAgents || 0} agents currently active`}
            icon={Users}
            isLoading={kpisLoading}
          />
          <KPICard
            title="Total Sessions"
            value={kpis?.totalSessions || 0}
            subtitle={`${kpis?.completedSessions || 0} completed, ${kpis?.abandonedSessions || 0} abandoned`}
            icon={MessageSquare}
            isLoading={kpisLoading}
          />
          <KPICard
            title="Completion Rate"
            value={`${kpis?.averageCompletionRate || 0}%`}
            subtitle={`${kpis?.completionRateThisMonth || 0}% this month`}
            icon={TrendingUp}
            isLoading={kpisLoading}
            trend={
              kpis?.averageCompletionRate
                ? {
                    value: kpis.averageCompletionRate,
                    isPositive: kpis.averageCompletionRate >= 50,
                  }
                : undefined
            }
          />
          <KPICard
            title="Webhook Health"
            value={`${kpis?.webhookHealth.successRate || 0}%`}
            subtitle={`${kpis?.webhookHealth.successful || 0} / ${kpis?.webhookHealth.total || 0} successful`}
            icon={Webhook}
            isLoading={kpisLoading}
            trend={
              kpis?.webhookHealth.total
                ? {
                    value: kpis.webhookHealth.successRate,
                    isPositive: kpis.webhookHealth.successRate >= 95,
                  }
                : undefined
            }
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted">
                Sessions This Month
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpis?.sessionsThisMonth || 0}
              </div>
              <p className="text-xs text-muted mt-1">
                {kpis?.totalSessions || 0} total sessions
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted">
                Average Duration
              </CardTitle>
              <Clock className="h-4 w-4 text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpis?.averageDuration || 0}
              </div>
              <p className="text-xs text-muted mt-1">
                minutes per session
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted">
                Failed Webhooks
              </CardTitle>
              <Webhook className="h-4 w-4 text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger">
                {kpis?.webhookHealth.failed || 0}
              </div>
              <p className="text-xs text-muted mt-1">
                out of {kpis?.webhookHealth.total || 0} total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">
              <MessageSquare className="mr-2 h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="performance">
              <BarChart3 className="mr-2 h-4 w-4" />
              Agent Performance
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              <Webhook className="mr-2 h-4 w-4" />
              Webhook Health
            </TabsTrigger>
            <TabsTrigger value="usage">
              <Activity className="mr-2 h-4 w-4" />
              Usage Metrics
            </TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            {/* Sessions Over Time Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sessions Over Time</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={timeRange === 7 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange(7)}
                    >
                      7d
                    </Button>
                    <Button
                      variant={timeRange === 30 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange(30)}
                    >
                      30d
                    </Button>
                    <Button
                      variant={timeRange === 90 ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeRange(90)}
                    >
                      90d
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted">Loading chart data...</div>
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted mx-auto mb-4" />
                      <p className="text-muted">No session data available</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgb(var(--success))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="rgb(var(--success))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAbandoned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgb(var(--danger))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="rgb(var(--danger))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                      <XAxis
                        dataKey="date"
                        stroke="rgb(var(--muted))"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis stroke="rgb(var(--muted))" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgb(var(--card))',
                          border: '1px solid rgb(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sessions"
                        stroke="rgb(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorSessions)"
                        name="Total Sessions"
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="rgb(var(--success))"
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                        name="Completed"
                      />
                      <Area
                        type="monotone"
                        dataKey="abandoned"
                        stroke="rgb(var(--danger))"
                        fillOpacity={1}
                        fill="url(#colorAbandoned)"
                        name="Abandoned"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Completion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Completion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                {funnelLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted">Loading funnel data...</div>
                  </div>
                ) : funnelData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted mx-auto mb-4" />
                      <p className="text-muted">No funnel data available</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={funnelData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                      <XAxis
                        dataKey="stage"
                        stroke="rgb(var(--muted))"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis stroke="rgb(var(--muted))" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgb(var(--card))',
                          border: '1px solid rgb(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value}`, 'Count']}
                      />
                      <Bar dataKey="count" fill="rgb(var(--primary))" radius={[8, 8, 0, 0]}>
                        {funnelData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.stage === 'Completed'
                                ? 'rgb(var(--success))'
                                : entry.stage === 'Abandoned'
                                ? 'rgb(var(--danger))'
                                : entry.stage === 'In Progress'
                                ? 'rgb(var(--warning))'
                                : 'rgb(var(--primary))'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent Performance Tab */}
          <TabsContent value="performance">
            <AgentPerformanceTable agentId={selectedAgentId} />
          </TabsContent>

          {/* Webhook Health Tab */}
          <TabsContent value="webhooks">
            <WebhookHealthTable agentId={selectedAgentId} />
          </TabsContent>

          {/* Usage Metrics Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {usageLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : !usageMetrics || usageMetrics.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                      <Activity className="h-12 w-12 text-muted mx-auto mb-4" />
                      <p className="text-muted">No usage metrics available</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {usageMetrics.map((metric) => (
                      <div
                        key={metric.resourceType}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface transition-colors"
                      >
                        <div>
                          <div className="font-medium">{metric.resourceType}</div>
                          <div className="text-sm text-muted">
                            {new Date(metric.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">{metric.usageCount}</div>
                          {metric.limit && (
                            <div className="text-xs text-muted">
                              of {metric.limit} limit
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Export Dialog */}
      <ExportAnalyticsDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        agentId={selectedAgentId}
      />
    </DashboardLayout>
  );
}
