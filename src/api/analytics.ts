import { supabase } from '@/lib/supabase';
import { getSessionMetrics } from './sessions';

/**
 * Analytics data types
 */
export interface AnalyticsKPIs {
  activeAgents: number;
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  averageCompletionRate: number;
  averageDuration: number;
  sessionsThisMonth: number;
  completionRateThisMonth: number;
  webhookHealth: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
}

export interface SessionTimeSeries {
  date: string;
  sessions: number;
  completed: number;
  abandoned: number;
}

export interface CompletionFunnel {
  stage: string;
  count: number;
  percentage: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  completionRate: number;
  averageDuration: number;
  lastActivity: string | null;
}

export interface WebhookHealth {
  webhookId: string;
  webhookName: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  averageResponseTime: number;
  lastDeliveryAt: string | null;
  status: 'healthy' | 'warning' | 'critical';
}

export interface UsageMetrics {
  resourceType: string;
  usageCount: number;
  limit?: number;
  percentage?: number;
  timestamp: string;
}

/**
 * Get comprehensive analytics KPIs
 */
export async function getAnalyticsKPIs(agentId?: string): Promise<AnalyticsKPIs> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get agent metrics
  const sessionMetrics = await getSessionMetrics(agentId);

  // Get active agents count
  let agentsQuery = supabase
    .from('agents')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['draft', 'published']);

  if (agentId) {
    agentsQuery = agentsQuery.eq('id', agentId);
  }

  const { data: agents } = await agentsQuery;
  const activeAgents = agents?.length || 0;

  // Get webhook health
  let webhooksQuery = supabase
    .from('webhooks')
    .select('id, total_deliveries, successful_deliveries, failed_deliveries')
    .eq('user_id', user.id)
    .eq('enabled', true);

  if (agentId) {
    webhooksQuery = webhooksQuery.eq('agent_id', agentId);
  }

  const { data: webhooks } = await webhooksQuery;
  
  const webhookTotal = (webhooks || []).reduce((sum: number, w: any) => sum + (w.total_deliveries || 0), 0);
  const webhookSuccessful = (webhooks || []).reduce((sum: number, w: any) => sum + (w.successful_deliveries || 0), 0);
  const webhookFailed = (webhooks || []).reduce((sum: number, w: any) => sum + (w.failed_deliveries || 0), 0);
  const webhookSuccessRate = webhookTotal > 0 
    ? Math.round((webhookSuccessful / webhookTotal) * 100)
    : 0;

  return {
    activeAgents,
    totalSessions: sessionMetrics.totalSessions,
    completedSessions: sessionMetrics.completedSessions,
    abandonedSessions: sessionMetrics.abandonedSessions,
    averageCompletionRate: sessionMetrics.averageCompletionRate,
    averageDuration: sessionMetrics.averageDuration,
    sessionsThisMonth: sessionMetrics.sessionsThisMonth,
    completionRateThisMonth: sessionMetrics.completionRateThisMonth,
    webhookHealth: {
      total: webhookTotal,
      successful: webhookSuccessful,
      failed: webhookFailed,
      successRate: webhookSuccessRate,
    },
  };
}

/**
 * Get sessions over time (time series data)
 */
export async function getSessionsOverTime(
  days: 7 | 30 | 90 = 30,
  agentId?: string
): Promise<SessionTimeSeries[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let sessionsQuery = supabase
    .from('sessions')
    .select('id, status, started_at')
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString());

  if (agentId) {
    sessionsQuery = sessionsQuery.eq('agent_id', agentId);
  } else {
    // Get sessions for all user's agents
    const { data: agents } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id);
    
    if (agents && agents.length > 0) {
      sessionsQuery = sessionsQuery.in('agent_id', (agents as any[]).map((a: any) => a.id));
    } else {
      return [];
    }
  }

  const { data: sessions } = await sessionsQuery;

  if (!sessions || sessions.length === 0) {
    return [];
  }

  // Group by date
  const dateMap = new Map<string, { sessions: number; completed: number; abandoned: number }>();

  (sessions as any[]).forEach((session: any) => {
    const date = new Date(session.started_at).toISOString().split('T')[0];
    const existing = dateMap.get(date) || { sessions: 0, completed: 0, abandoned: 0 };
    existing.sessions += 1;
    if (session.status === 'completed') {
      existing.completed += 1;
    } else if (session.status === 'abandoned') {
      existing.abandoned += 1;
    }
    dateMap.set(date, existing);
  });

  // Convert to array and sort by date
  const result: SessionTimeSeries[] = Array.from(dateMap.entries())
    .map(([date, counts]) => ({
      date,
      sessions: counts.sessions,
      completed: counts.completed,
      abandoned: counts.abandoned,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return result;
}

/**
 * Get completion funnel data
 */
export async function getCompletionFunnel(agentId?: string): Promise<CompletionFunnel[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let sessionsQuery = supabase
    .from('sessions')
    .select('status, completion_rate');

  if (agentId) {
    sessionsQuery = sessionsQuery.eq('agent_id', agentId);
  } else {
    // Get sessions for all user's agents
    const { data: agents } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id);
    
    if (agents && agents.length > 0) {
      sessionsQuery = sessionsQuery.in('agent_id', (agents as any[]).map((a: any) => a.id));
    } else {
      return [];
    }
  }

  const { data: sessions } = await sessionsQuery;

  if (!sessions || sessions.length === 0) {
    return [];
  }

  const total = sessions.length;
  const started = total;
  const inProgress = (sessions as any[]).filter((s: any) => s.status === 'active').length;
  const completed = (sessions as any[]).filter((s: any) => s.status === 'completed').length;
  const abandoned = (sessions as any[]).filter((s: any) => s.status === 'abandoned').length;

  return [
    {
      stage: 'Started',
      count: started,
      percentage: 100,
    },
    {
      stage: 'In Progress',
      count: inProgress,
      percentage: total > 0 ? Math.round((inProgress / total) * 100) : 0,
    },
    {
      stage: 'Completed',
      count: completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
    {
      stage: 'Abandoned',
      count: abandoned,
      percentage: total > 0 ? Math.round((abandoned / total) * 100) : 0,
    },
  ];
}

/**
 * Get agent performance breakdown
 */
export async function getAgentPerformance(agentId?: string): Promise<AgentPerformance[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get user's agents
  let agentsQuery = supabase
    .from('agents')
    .select('id, name, last_activity_at')
    .eq('user_id', user.id);

  if (agentId) {
    agentsQuery = agentsQuery.eq('id', agentId);
  }

  const { data: agents } = await agentsQuery;

  if (!agents || agents.length === 0) {
    return [];
  }

  // Get performance for each agent
  const performancePromises = (agents as any[]).map(async (agent: any) => {
    const metrics = await getSessionMetrics(agent.id);
    
    return {
      agentId: agent.id,
      agentName: agent.name,
      totalSessions: metrics.totalSessions,
      completedSessions: metrics.completedSessions,
      abandonedSessions: metrics.abandonedSessions,
      completionRate: metrics.averageCompletionRate,
      averageDuration: metrics.averageDuration,
      lastActivity: agent.last_activity_at,
    };
  });

  const performance = await Promise.all(performancePromises);

  // Sort by total sessions descending
  return performance.sort((a, b) => b.totalSessions - a.totalSessions);
}

/**
 * Get webhook health metrics
 */
export async function getWebhookHealth(agentId?: string): Promise<WebhookHealth[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let webhooksQuery = supabase
    .from('webhooks')
    .select('id, name, agent_id, total_deliveries, successful_deliveries, failed_deliveries, last_delivery_at')
    .eq('user_id', user.id)
    .eq('enabled', true);

  if (agentId) {
    webhooksQuery = webhooksQuery.eq('agent_id', agentId);
  }

  const { data: webhooks } = await webhooksQuery;

  if (!webhooks || webhooks.length === 0) {
    return [];
  }

  // Get delivery metrics for each webhook
  const healthPromises = (webhooks as any[]).map(async (webhook: any) => {
    // Get recent deliveries for response time calculation
    const { data: deliveries } = await supabase
      .from('webhook_deliveries')
      .select('duration_ms, status')
      .eq('webhook_id', webhook.id)
      .order('started_at', { ascending: false })
      .limit(100);

    const totalDeliveries = webhook.total_deliveries || 0;
    const successfulDeliveries = webhook.successful_deliveries || 0;
    const failedDeliveries = webhook.failed_deliveries || 0;
    const successRate = totalDeliveries > 0
      ? Math.round((successfulDeliveries / totalDeliveries) * 100)
      : 0;

    // Calculate average response time
    const validDurations = (deliveries || [])
      .filter((d: any) => d.duration_ms !== null && d.duration_ms !== undefined)
      .map((d: any) => d.duration_ms);
    const averageResponseTime = validDurations.length > 0
      ? Math.round(validDurations.reduce((sum: number, d: number) => sum + d, 0) / validDurations.length)
      : 0;

    // Determine status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (successRate < 80) {
      status = 'critical';
    } else if (successRate < 95) {
      status = 'warning';
    }

    return {
      webhookId: webhook.id,
      webhookName: webhook.name,
      totalDeliveries,
      successfulDeliveries,
      failedDeliveries,
      successRate,
      averageResponseTime,
      lastDeliveryAt: webhook.last_delivery_at,
      status,
    };
  });

  return Promise.all(healthPromises);
}

/**
 * Get usage metrics
 */
export async function getUsageMetrics(agentId?: string): Promise<UsageMetrics[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get session count
  let sessionsQuery = supabase
    .from('sessions')
    .select('id')
    .gte('started_at', thisMonthStart.toISOString());

  if (agentId) {
    sessionsQuery = sessionsQuery.eq('agent_id', agentId);
  } else {
    const { data: agents } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id);
    
    if (agents && agents.length > 0) {
      sessionsQuery = sessionsQuery.in('agent_id', (agents as any[]).map((a: any) => a.id));
    } else {
      return [];
    }
  }

  const { count: sessionCount } = await sessionsQuery;

  // Get agent count
  let agentsQuery = supabase
    .from('agents')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .in('status', ['draft', 'published']);

  if (agentId) {
    agentsQuery = agentsQuery.eq('id', agentId);
  }

  const { count: agentCount } = await agentsQuery;

  // Get webhook count
  let webhooksQuery = supabase
    .from('webhooks')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('enabled', true);

  if (agentId) {
    webhooksQuery = webhooksQuery.eq('agent_id', agentId);
  }

  const { count: webhookCount } = await webhooksQuery;

  return [
    {
      resourceType: 'Sessions',
      usageCount: sessionCount || 0,
      timestamp: now.toISOString(),
    },
    {
      resourceType: 'Agents',
      usageCount: agentCount || 0,
      timestamp: now.toISOString(),
    },
    {
      resourceType: 'Webhooks',
      usageCount: webhookCount || 0,
      timestamp: now.toISOString(),
    },
  ];
}

/**
 * Export analytics data as JSON
 */
export async function exportAnalyticsJSON(
  filters?: {
    agentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<string> {
  const [kpis, sessionsOverTime, completionFunnel, agentPerformance, webhookHealth, usageMetrics] = await Promise.all([
    getAnalyticsKPIs(filters?.agentId),
    getSessionsOverTime(30, filters?.agentId),
    getCompletionFunnel(filters?.agentId),
    getAgentPerformance(filters?.agentId),
    getWebhookHealth(filters?.agentId),
    getUsageMetrics(filters?.agentId),
  ]);

  const exportData = {
    kpis,
    sessionsOverTime,
    completionFunnel,
    agentPerformance,
    webhookHealth,
    usageMetrics,
    filters,
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export analytics data as CSV
 */
export async function exportAnalyticsCSV(
  filters?: {
    agentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<string> {
  const [kpis, sessionsOverTime, completionFunnel, agentPerformance, webhookHealth] = await Promise.all([
    getAnalyticsKPIs(filters?.agentId),
    getSessionsOverTime(30, filters?.agentId),
    getCompletionFunnel(filters?.agentId),
    getAgentPerformance(filters?.agentId),
    getWebhookHealth(filters?.agentId),
  ]);

  const csvRows: string[] = [];

  // KPIs
  csvRows.push('Analytics Export');
  csvRows.push(`Exported: ${new Date().toISOString()}`);
  csvRows.push('');
  csvRows.push('Key Performance Indicators');
  csvRows.push('Metric,Value');
  csvRows.push(`Active Agents,${kpis.activeAgents}`);
  csvRows.push(`Total Sessions,${kpis.totalSessions}`);
  csvRows.push(`Completed Sessions,${kpis.completedSessions}`);
  csvRows.push(`Abandoned Sessions,${kpis.abandonedSessions}`);
  csvRows.push(`Average Completion Rate,${kpis.averageCompletionRate}%`);
  csvRows.push(`Average Duration,${kpis.averageDuration} minutes`);
  csvRows.push(`Sessions This Month,${kpis.sessionsThisMonth}`);
  csvRows.push(`Completion Rate This Month,${kpis.completionRateThisMonth}%`);
  csvRows.push('');
  
  // Sessions Over Time
  csvRows.push('Sessions Over Time');
  csvRows.push('Date,Total Sessions,Completed,Abandoned');
  sessionsOverTime.forEach((item) => {
    csvRows.push(`${item.date},${item.sessions},${item.completed},${item.abandoned}`);
  });
  csvRows.push('');

  // Completion Funnel
  csvRows.push('Completion Funnel');
  csvRows.push('Stage,Count,Percentage');
  completionFunnel.forEach((item) => {
    csvRows.push(`${item.stage},${item.count},${item.percentage}%`);
  });
  csvRows.push('');

  // Agent Performance
  csvRows.push('Agent Performance');
  csvRows.push('Agent Name,Total Sessions,Completed,Abandoned,Completion Rate,Average Duration');
  agentPerformance.forEach((item) => {
    csvRows.push(
      `"${item.agentName}",${item.totalSessions},${item.completedSessions},${item.abandonedSessions},${item.completionRate}%,${item.averageDuration}`
    );
  });
  csvRows.push('');

  // Webhook Health
  csvRows.push('Webhook Health');
  csvRows.push('Webhook Name,Total Deliveries,Successful,Failed,Success Rate,Average Response Time (ms),Status');
  webhookHealth.forEach((item) => {
    csvRows.push(
      `"${item.webhookName}",${item.totalDeliveries},${item.successfulDeliveries},${item.failedDeliveries},${item.successRate}%,${item.averageResponseTime},${item.status}`
    );
  });

  return csvRows.join('\n');
}
