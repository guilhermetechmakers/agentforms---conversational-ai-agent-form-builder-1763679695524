import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPICard } from '@/components/admin/KPICard';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { SystemHealth } from '@/components/admin/SystemHealth';
import { ErrorLogViewer } from '@/components/admin/ErrorLogViewer';
import { ValidationRuleEditor } from '@/components/admin/ValidationRuleEditor';
import { MonitoringDashboard } from '@/components/admin/MonitoringDashboard';
import {
  useAdminKPIs,
  useSessionsOverTime,
  useCompletionFunnel,
  useAgentPerformance,
} from '@/hooks/useAdmin';
import {
  Users,
  MessageSquare,
  TrendingUp,
  Webhook,
  BarChart3,
  Activity,
  AlertTriangle,
  Settings,
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

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

  const { data: kpis, isLoading: kpisLoading } = useAdminKPIs();
  const { data: sessionsOverTime, isLoading: sessionsLoading } = useSessionsOverTime(timeRange);
  const { data: completionFunnel, isLoading: funnelLoading } = useCompletionFunnel();
  const { data: agentPerformance, isLoading: performanceLoading } = useAgentPerformance();

  // Format sessions over time data for chart
  const chartData = sessionsOverTime?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sessions: item.sessions,
    completed: item.completed,
  })) || [];

  // Format completion funnel data
  const funnelData = completionFunnel || [];

  // Format agent performance data
  const performanceData = agentPerformance?.slice(0, 10) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div>
          <h1 className="text-h2">Admin Dashboard</h1>
          <p className="text-muted mt-1">Monitor your organization's performance and manage team members</p>
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
            subtitle="All time sessions"
            icon={MessageSquare}
            isLoading={kpisLoading}
          />
          <KPICard
            title="Completion Rate"
            value={`${kpis?.completionRate || 0}%`}
            subtitle="Average completion rate"
            icon={TrendingUp}
            isLoading={kpisLoading}
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="health">
              <Activity className="mr-2 h-4 w-4" />
              System Health
            </TabsTrigger>
            <TabsTrigger value="monitoring">
              <Activity className="mr-2 h-4 w-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="errors">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Error Logs
            </TabsTrigger>
            <TabsTrigger value="validation">
              <Settings className="mr-2 h-4 w-4" />
              Validation Rules
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Sessions Over Time Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sessions Over Time</CardTitle>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTimeRange(7)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        timeRange === 7
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-surface text-muted hover:bg-border'
                      }`}
                    >
                      7d
                    </button>
                    <button
                      onClick={() => setTimeRange(30)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        timeRange === 30
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-surface text-muted hover:bg-border'
                      }`}
                    >
                      30d
                    </button>
                    <button
                      onClick={() => setTimeRange(90)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        timeRange === 90
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-surface text-muted hover:bg-border'
                      }`}
                    >
                      90d
                    </button>
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

            {/* Agent Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted">Loading performance data...</div>
                  </div>
                ) : performanceData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted mx-auto mb-4" />
                      <p className="text-muted">No performance data available</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {performanceData.map((agent) => (
                      <div
                        key={agent.agentId}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{agent.agentName}</div>
                          <div className="text-sm text-muted">
                            {agent.totalSessions} sessions • {agent.completedSessions} completed
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{agent.completionRate}%</div>
                          <div className="text-xs text-muted">completion rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <UserManagementTable />
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health">
            <SystemHealth />
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <MonitoringDashboard />
          </TabsContent>

          {/* Error Logs Tab */}
          <TabsContent value="errors">
            <ErrorLogViewer />
          </TabsContent>

          {/* Validation Rules Tab */}
          <TabsContent value="validation">
            <ValidationRuleEditor />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
