import { supabase } from '@/lib/supabase';
import type { TeamMemberRow } from '@/types/database/team-member';

/**
 * Admin Dashboard KPIs
 */
export interface AdminKPIs {
  activeAgents: number;
  totalSessions: number;
  completionRate: number;
  webhookHealth: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
}

/**
 * Get admin dashboard KPIs
 */
export async function getAdminKPIs(): Promise<AdminKPIs> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get all agents for the user (organization owner)
  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['draft', 'published']);

  if (agentsError) {
    throw new Error(`Failed to fetch agents: ${agentsError.message}`);
  }

  const activeAgents = agents?.length || 0;
  const agentIds = (agents || []).map((a: any) => a.id);

  // Get sessions count
  let sessionsQuery = supabase
    .from('sessions')
    .select('id, status, completion_rate');

  if (agentIds.length > 0) {
    sessionsQuery = sessionsQuery.in('agent_id', agentIds);
  } else {
    // Return empty if no agents
    return {
      activeAgents: 0,
      totalSessions: 0,
      completionRate: 0,
      webhookHealth: {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
      },
    };
  }

  const { data: sessions, error: sessionsError } = await sessionsQuery;

  if (sessionsError) {
    throw new Error(`Failed to fetch sessions: ${sessionsError.message}`);
  }

  const totalSessions = sessions?.length || 0;
  const completedSessions = (sessions || []).filter((s: any) => s.status === 'completed').length;
  const completionRate = totalSessions > 0 
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0;

  // Get webhook health
  const { data: webhooks, error: webhooksError } = await supabase
    .from('webhooks')
    .select('id')
    .eq('user_id', user.id)
    .eq('enabled', true);

  if (webhooksError) {
    throw new Error(`Failed to fetch webhooks: ${webhooksError.message}`);
  }

  const webhookIds = (webhooks || []).map((w: any) => w.id);
  
  let webhookDeliveriesQuery = supabase
    .from('webhook_deliveries')
    .select('id, status');

  if (webhookIds.length > 0) {
    webhookDeliveriesQuery = webhookDeliveriesQuery.in('webhook_id', webhookIds);
  }

  const { data: deliveries, error: deliveriesError } = await webhookDeliveriesQuery;

  if (deliveriesError) {
    throw new Error(`Failed to fetch webhook deliveries: ${deliveriesError.message}`);
  }

  const totalDeliveries = deliveries?.length || 0;
  const successfulDeliveries = (deliveries || []).filter((d: any) => d.status === 'success').length;
  const failedDeliveries = (deliveries || []).filter((d: any) => d.status === 'failed').length;
  const successRate = totalDeliveries > 0
    ? Math.round((successfulDeliveries / totalDeliveries) * 100)
    : 0;

  return {
    activeAgents,
    totalSessions,
    completionRate,
    webhookHealth: {
      total: totalDeliveries,
      successful: successfulDeliveries,
      failed: failedDeliveries,
      successRate,
    },
  };
}

/**
 * Sessions over time data point
 */
export interface SessionsOverTimeData {
  date: string;
  sessions: number;
  completed: number;
}

/**
 * Get sessions over time for charts
 */
export async function getSessionsOverTime(
  days: number = 30
): Promise<SessionsOverTimeData[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get user's agents
  const { data: agents } = await supabase
    .from('agents')
    .select('id')
    .eq('user_id', user.id);

  if (!agents || agents.length === 0) {
    return [];
  }

  const agentIds = agents.map((a: any) => a.id);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, status, started_at')
    .in('agent_id', agentIds)
    .gte('started_at', startDate.toISOString())
    .order('started_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }

  // Group by date
  const dateMap = new Map<string, { sessions: number; completed: number }>();

  (sessions || []).forEach((session: any) => {
    const date = new Date(session.started_at).toISOString().split('T')[0];
    const existing = dateMap.get(date) || { sessions: 0, completed: 0 };
    existing.sessions += 1;
    if (session.status === 'completed') {
      existing.completed += 1;
    }
    dateMap.set(date, existing);
  });

  // Fill in missing dates
  const result: SessionsOverTimeData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const data = dateMap.get(dateStr) || { sessions: 0, completed: 0 };
    result.push({
      date: dateStr,
      sessions: data.sessions,
      completed: data.completed,
    });
  }

  return result;
}

/**
 * Completion funnel data
 */
export interface CompletionFunnelData {
  stage: string;
  count: number;
  percentage: number;
}

/**
 * Get completion funnel data
 */
export async function getCompletionFunnel(): Promise<CompletionFunnelData[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get user's agents
  const { data: agents } = await supabase
    .from('agents')
    .select('id')
    .eq('user_id', user.id);

  if (!agents || agents.length === 0) {
    return [];
  }

  const agentIds = agents.map((a: any) => a.id);

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('status, completion_rate')
    .in('agent_id', agentIds);

  if (error) {
    throw new Error(`Failed to fetch sessions: ${error.message}`);
  }

  const total = sessions?.length || 0;
  if (total === 0) {
    return [];
  }

  const started = total;
  const inProgress = (sessions || []).filter((s: any) => s.status === 'active').length;
  const completed = (sessions || []).filter((s: any) => s.status === 'completed').length;
  const abandoned = (sessions || []).filter((s: any) => s.status === 'abandoned').length;

  return [
    { stage: 'Started', count: started, percentage: 100 },
    { stage: 'In Progress', count: inProgress, percentage: total > 0 ? Math.round((inProgress / total) * 100) : 0 },
    { stage: 'Completed', count: completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 },
    { stage: 'Abandoned', count: abandoned, percentage: total > 0 ? Math.round((abandoned / total) * 100) : 0 },
  ];
}

/**
 * Per-agent performance breakdown
 */
export interface AgentPerformance {
  agentId: string;
  agentName: string;
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  averageCompletionRate: number;
}

/**
 * Get per-agent performance breakdown
 */
export async function getAgentPerformance(): Promise<AgentPerformance[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: agents, error: agentsError } = await supabase
    .from('agents')
    .select('id, name')
    .eq('user_id', user.id)
    .in('status', ['draft', 'published']);

  if (agentsError) {
    throw new Error(`Failed to fetch agents: ${agentsError.message}`);
  }

  if (!agents || agents.length === 0) {
    return [];
  }

  const agentIds = agents.map((a: any) => a.id);

  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('agent_id, status, completion_rate')
    .in('agent_id', agentIds);

  if (sessionsError) {
    throw new Error(`Failed to fetch sessions: ${sessionsError.message}`);
  }

  // Group by agent
  const agentMap = new Map<string, { sessions: any[]; name: string }>();

  agents.forEach((agent: any) => {
    agentMap.set(agent.id, { sessions: [], name: agent.name });
  });

  (sessions || []).forEach((session: any) => {
    const agentData = agentMap.get(session.agent_id);
    if (agentData) {
      agentData.sessions.push(session);
    }
  });

  const result: AgentPerformance[] = [];

  agentMap.forEach((data, agentId) => {
    const totalSessions = data.sessions.length;
    const completedSessions = data.sessions.filter((s: any) => s.status === 'completed').length;
    const completionRate = totalSessions > 0 
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

    const completionRates = data.sessions
      .map((s: any) => Number(s.completion_rate) || 0)
      .filter((rate: number) => rate > 0);
    const averageCompletionRate = completionRates.length > 0
      ? completionRates.reduce((sum: number, rate: number) => sum + rate, 0) / completionRates.length
      : 0;

    result.push({
      agentId,
      agentName: data.name,
      totalSessions,
      completedSessions,
      completionRate,
      averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
    });
  });

  return result.sort((a, b) => b.totalSessions - a.totalSessions);
}

/**
 * Get all team members for the organization
 */
export async function getTeamMembers(): Promise<TeamMemberRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get team members where user is the organization owner
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('organization_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch team members: ${error.message}`);
  }

  return data || [];
}

/**
 * Invite a new team member
 */
export async function inviteTeamMember(member: {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}): Promise<TeamMemberRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Generate invite token
  const inviteToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  const teamMembersTable = supabase.from('team_members') as any;
  const { data, error } = await teamMembersTable
    .insert({
      ...member,
      organization_id: user.id,
      invited_by: user.id,
      invite_token: inviteToken,
      invite_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to invite team member: ${error.message}`);
  }

  return data;
}

/**
 * Update team member role
 */
export async function updateTeamMemberRole(
  memberId: string,
  role: 'admin' | 'member' | 'viewer'
): Promise<TeamMemberRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const teamMembersTable = supabase.from('team_members') as any;
  const { data, error } = await teamMembersTable
    .update({ role })
    .eq('id', memberId)
    .eq('organization_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update team member role: ${error.message}`);
  }

  return data;
}

/**
 * Remove team member
 */
export async function removeTeamMember(memberId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId)
    .eq('organization_id', user.id);

  if (error) {
    throw new Error(`Failed to remove team member: ${error.message}`);
  }
}

/**
 * System health metrics
 */
export interface SystemHealth {
  llmUsage: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
  };
  rateLimits: {
    current: number;
    limit: number;
    resetAt: string;
  };
  deliveryQueue: {
    pending: number;
    processing: number;
    failed: number;
  };
}

/**
 * Get system health metrics
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  // In a real implementation, this would fetch from a metrics/analytics service
  // For now, we'll return mock data based on webhook deliveries
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get webhook deliveries as a proxy for system health
  const { data: webhooks } = await supabase
    .from('webhooks')
    .select('id')
    .eq('user_id', user.id);

  const webhookIds = (webhooks || []).map((w: any) => w.id);

  if (webhookIds.length === 0) {
    return {
      llmUsage: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageLatency: 0,
      },
      rateLimits: {
        current: 0,
        limit: 1000,
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      deliveryQueue: {
        pending: 0,
        processing: 0,
        failed: 0,
      },
    };
  }

  const { data: deliveries } = await supabase
    .from('webhook_deliveries')
    .select('status, started_at, completed_at')
    .in('webhook_id', webhookIds)
    .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const totalRequests = deliveries?.length || 0;
  const successfulRequests = (deliveries || []).filter((d: any) => d.status === 'success').length;
  const failedRequests = (deliveries || []).filter((d: any) => d.status === 'failed').length;
  
  // Calculate average latency (mock)
  const latencies = (deliveries || [])
    .filter((d: any) => d.completed_at && d.started_at)
    .map((d: any) => {
      const start = new Date(d.started_at).getTime();
      const end = new Date(d.completed_at).getTime();
      return end - start;
    });
  const averageLatency = latencies.length > 0
    ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length
    : 0;

  const pending = (deliveries || []).filter((d: any) => d.status === 'pending').length;
  const processing = (deliveries || []).filter((d: any) => d.status === 'retrying').length;
  const failed = failedRequests;

  return {
    llmUsage: {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageLatency: Math.round(averageLatency),
    },
    rateLimits: {
      current: totalRequests,
      limit: 1000,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    deliveryQueue: {
      pending,
      processing,
      failed,
    },
  };
}
