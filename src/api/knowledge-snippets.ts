import { supabase } from '@/lib/supabase';
import type { KnowledgeSnippetRow, KnowledgeSnippetInsert, KnowledgeSnippetUpdate } from '@/types/database/knowledge-snippet';

/**
 * Fetch all knowledge snippets for an agent
 */
export async function getKnowledgeSnippets(agentId: string): Promise<KnowledgeSnippetRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('knowledge_snippets')
    .select('*')
    .eq('agent_id', agentId)
    .eq('user_id', user.id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch knowledge snippets: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single knowledge snippet by ID
 */
export async function getKnowledgeSnippet(id: string): Promise<KnowledgeSnippetRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('knowledge_snippets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch knowledge snippet: ${error.message}`);
  }

  return data;
}

/**
 * Create a new knowledge snippet
 */
export async function createKnowledgeSnippet(snippet: KnowledgeSnippetInsert): Promise<KnowledgeSnippetRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the max display_order for this agent
  const { data: existingSnippets } = await supabase
    .from('knowledge_snippets')
    .select('display_order')
    .eq('agent_id', snippet.agent_id)
    .eq('user_id', user.id)
    .order('display_order', { ascending: false })
    .limit(1);

  const maxOrder = existingSnippets && existingSnippets.length > 0
    ? (existingSnippets[0] as any).display_order + 1
    : 0;

  const knowledgeSnippetsTable = supabase.from('knowledge_snippets') as any;
  const { data, error } = await knowledgeSnippetsTable
    .insert({
      ...snippet,
      user_id: user.id,
      display_order: snippet.display_order ?? maxOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create knowledge snippet: ${error.message}`);
  }

  return data;
}

/**
 * Update a knowledge snippet
 */
export async function updateKnowledgeSnippet(
  id: string,
  updates: KnowledgeSnippetUpdate
): Promise<KnowledgeSnippetRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const knowledgeSnippetsTable = supabase.from('knowledge_snippets') as any;
  const { data, error } = await knowledgeSnippetsTable
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update knowledge snippet: ${error.message}`);
  }

  return data;
}

/**
 * Delete a knowledge snippet
 */
export async function deleteKnowledgeSnippet(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('knowledge_snippets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete knowledge snippet: ${error.message}`);
  }
}

/**
 * Reorder knowledge snippets for an agent
 */
export async function reorderKnowledgeSnippets(
  agentId: string,
  snippetIds: string[]
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Update display_order for each snippet
  const updates = snippetIds.map((snippetId, index) => ({
    id: snippetId,
    display_order: index,
  }));

  for (const update of updates) {
    const knowledgeSnippetsTable = supabase.from('knowledge_snippets') as any;
    const { error } = await knowledgeSnippetsTable
      .update({ display_order: update.display_order })
      .eq('id', update.id)
      .eq('agent_id', agentId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to reorder knowledge snippets: ${error.message}`);
    }
  }
}
