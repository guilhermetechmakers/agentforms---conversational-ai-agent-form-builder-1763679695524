import { supabase } from '@/lib/supabase';
import type { AgentRow, AgentInsert, AgentUpdate } from '@/types/database/agent';

/**
 * Fetch all agents for the current user
 */
export async function getAgents(filters?: {
  status?: 'draft' | 'published' | 'archived';
  search?: string;
  tags?: string[];
}): Promise<AgentRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('agents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single agent by ID
 */
export async function getAgent(id: string): Promise<AgentRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch agent: ${error.message}`);
  }

  return data;
}

/**
 * Create a new agent
 */
export async function createAgent(agent: AgentInsert): Promise<AgentRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const agentsTable = supabase.from('agents') as any;
  const { data, error } = await agentsTable
    .insert({
      ...agent,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create agent: ${error.message}`);
  }

  return data;
}

/**
 * Update an agent
 */
export async function updateAgent(id: string, updates: AgentUpdate): Promise<AgentRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const agentsTable = supabase.from('agents') as any;
  const { data, error } = await agentsTable
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update agent: ${error.message}`);
  }

  return data;
}

/**
 * Delete an agent
 */
export async function deleteAgent(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete agent: ${error.message}`);
  }
}

/**
 * Duplicate an agent
 */
export async function duplicateAgent(id: string): Promise<AgentRow> {
  const agent = await getAgent(id);
  
  if (!agent) {
    throw new Error('Agent not found');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Create a copy with a new name
  const duplicatedAgent: AgentInsert = {
    user_id: user.id,
    name: `${agent.name} (Copy)`,
    status: 'draft',
    schema: agent.schema,
    persona: agent.persona,
    knowledge: agent.knowledge,
    visuals: agent.visuals,
    publish: {
      ...agent.publish,
      slug: `${agent.publish.slug}-copy-${Date.now()}`,
      publicUrl: '',
    },
    tags: agent.tags,
  };

  return createAgent(duplicatedAgent);
}

/**
 * Get agent usage statistics
 */
export async function getAgentUsageStats(agentId?: string): Promise<{
  monthlySessions: number;
  completionRate: number;
  activeAgents: number;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get monthly sessions count
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let sessionsQuery = supabase
    .from('sessions')
    .select('id, completion_rate, status')
    .gte('started_at', startOfMonth.toISOString());

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
      return {
        monthlySessions: 0,
        completionRate: 0,
        activeAgents: 0,
      };
    }
  }

  const { data: sessions } = await sessionsQuery;

  const monthlySessions = sessions?.length || 0;
  const completedSessions = (sessions as any[])?.filter((s: any) => s.status === 'completed').length || 0;
  const completionRate = monthlySessions > 0 
    ? Math.round((completedSessions / monthlySessions) * 100)
    : 0;

  // Get active agents count
  const { data: agents } = await supabase
    .from('agents')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['draft', 'published']);

  const activeAgents = agents?.length || 0;

  return {
    monthlySessions,
    completionRate,
    activeAgents,
  };
}
