import { useState } from 'react';
import { useErrorLogs } from '@/hooks/useErrors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { format, subDays } from 'date-fns';

interface MonitoringStats {
  totalErrors: number;
  errorsLast24h: number;
  errorsLast7d: number;
  errorRate: number;
  mostCommonError: string;
  errorsByType: Record<string, number>;
  errorsOverTime: Array<{ date: string; count: number }>;
}

export function MonitoringDashboard() {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const { data: errorLogs, isLoading } = useErrorLogs(1000);

  // Calculate statistics
  const calculateStats = (): MonitoringStats => {
    if (!errorLogs || errorLogs.length === 0) {
      return {
        totalErrors: 0,
        errorsLast24h: 0,
        errorsLast7d: 0,
        errorRate: 0,
        mostCommonError: 'N/A',
        errorsByType: {},
        errorsOverTime: [],
      };
    }

    const now = new Date();
    const last24h = subDays(now, 1);
    const last7d = subDays(now, 7);
    const last30d = subDays(now, timeRange);

    const errorsLast24h = errorLogs.filter(
      (log) => new Date(log.created_at) >= last24h
    ).length;

    const errorsLast7d = errorLogs.filter(
      (log) => new Date(log.created_at) >= last7d
    ).length;

    const errorsInRange = errorLogs.filter(
      (log) => new Date(log.created_at) >= last30d
    );

    // Errors by type
    const errorsByType = errorsInRange.reduce(
      (acc, log) => {
        acc[log.error_type] = (acc[log.error_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Most common error
    const errorMessages = errorsInRange
      .map((log) => log.error_message)
      .filter((msg): msg is string => !!msg);
    const messageCounts = errorMessages.reduce(
      (acc, msg) => {
        acc[msg] = (acc[msg] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const mostCommonError =
      Object.entries(messageCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    // Errors over time
    const errorsOverTime = Array.from({ length: timeRange }, (_, i) => {
      const date = subDays(now, timeRange - i - 1);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = errorsInRange.filter((log) => {
        const logDate = format(new Date(log.created_at), 'yyyy-MM-dd');
        return logDate === dateStr;
      }).length;
      return { date: format(date, 'MMM d'), count };
    });

    // Error rate (errors per day)
    const errorRate = errorsLast7d / 7;

    return {
      totalErrors: errorLogs.length,
      errorsLast24h,
      errorsLast7d,
      errorRate: Math.round(errorRate * 10) / 10,
      mostCommonError,
      errorsByType,
      errorsOverTime,
    };
  };

  const stats = calculateStats();

  // Prepare chart data
  const pieData = Object.entries(stats.errorsByType).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    'rgb(var(--primary))',
    'rgb(var(--danger))',
    'rgb(var(--warning))',
    'rgb(var(--success))',
    'rgb(var(--muted))',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Monitoring Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time application health and error monitoring
          </p>
        </div>
        <Select value={String(timeRange)} onValueChange={(v) => setTimeRange(Number(v) as 7 | 30 | 90)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalErrors}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.errorsLast24h}</div>
            <p className="text-xs text-muted-foreground">
              {stats.errorsLast24h > 0 ? (
                <span className="text-danger">Active issues</span>
              ) : (
                <span className="text-success">No errors</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.errorsLast7d}</div>
            <p className="text-xs text-muted-foreground">
              {stats.errorRate} errors/day average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            {stats.errorsLast24h === 0 ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : stats.errorsLast24h < 10 ? (
              <AlertTriangle className="h-4 w-4 text-warning" />
            ) : (
              <XCircle className="h-4 w-4 text-danger" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.errorsLast24h === 0 ? (
                <span className="text-success">Healthy</span>
              ) : stats.errorsLast24h < 10 ? (
                <span className="text-warning">Warning</span>
              ) : (
                <span className="text-danger">Critical</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.errorsLast24h === 0
                ? 'No errors detected'
                : `${stats.errorsLast24h} errors in last 24h`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Errors Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Errors Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">Loading chart data...</div>
              </div>
            ) : stats.errorsOverTime.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No error data available</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.errorsOverTime}>
                  <defs>
                    <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="count"
                    stroke="rgb(var(--danger))"
                    fillOpacity={1}
                    fill="url(#colorErrors)"
                    name="Errors"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Errors by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Errors by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">Loading chart data...</div>
              </div>
            ) : pieData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No error data available</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(stats.errorsByType).map(([type, count], index) => (
                    <Badge
                      key={type}
                      variant="outline"
                      style={{
                        borderColor: COLORS[index % COLORS.length],
                        color: COLORS[index % COLORS.length],
                      }}
                    >
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Common Error */}
      <Card>
        <CardHeader>
          <CardTitle>Most Common Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-surface border border-border p-4">
            <p className="text-sm font-medium mb-2">Error Message:</p>
            <p className="text-sm text-muted-foreground break-all">
              {stats.mostCommonError}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
