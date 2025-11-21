import { supabase } from '@/lib/supabase';
import type {
  FAQRow,
  FAQUpdate,
  FAQCategory,
} from '@/types/database/faq';
import type {
  SupportRequestRow,
  SupportRequestInsert,
} from '@/types/database/support-request';
import type {
  HelpCenterInteractionRow,
  HelpCenterInteractionInsert,
} from '@/types/database/help-center-interaction';

// =====================================================
// FAQ Functions
// =====================================================

/**
 * Fetch all published FAQs, optionally filtered by category
 */
export async function getFAQs(category?: FAQCategory): Promise<FAQRow[]> {
  let query = supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch FAQs: ${error.message}`);
  }

  return data || [];
}

/**
 * Search FAQs by query string
 */
export async function searchFAQs(query: string): Promise<FAQRow[]> {
  if (!query || query.trim().length === 0) {
    return getFAQs();
  }

  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to search FAQs: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single FAQ by ID
 */
export async function getFAQ(id: string): Promise<FAQRow | null> {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch FAQ: ${error.message}`);
  }

  return data;
}

/**
 * Increment FAQ view count
 */
export async function incrementFAQView(id: string): Promise<void> {
  const { data: faq } = await supabase
    .from('faqs')
    .select('view_count')
    .eq('id', id)
    .single();

  if (faq) {
    const currentCount = (faq as any).view_count || 0;
    const faqsTable = supabase.from('faqs') as any;
    await faqsTable
      .update({ view_count: currentCount + 1 })
      .eq('id', id);
  }
}

/**
 * Submit FAQ feedback (helpful/not helpful)
 */
export async function submitFAQFeedback(
  id: string,
  isHelpful: boolean
): Promise<void> {
  const { data: faq } = await supabase
    .from('faqs')
    .select('helpful_count,not_helpful_count')
    .eq('id', id)
    .single();

  if (faq) {
    const update: FAQUpdate = isHelpful
      ? { helpful_count: ((faq as any).helpful_count || 0) + 1 }
      : { not_helpful_count: ((faq as any).not_helpful_count || 0) + 1 };

    const faqsTable = supabase.from('faqs') as any;
    const { error } = await faqsTable
      .update(update)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to submit feedback: ${error.message}`);
    }
  }
}

// =====================================================
// Support Request Functions
// =====================================================

/**
 * Create a new support request
 */
export async function createSupportRequest(
  request: SupportRequestInsert
): Promise<SupportRequestRow> {
  const { data: { user } } = await supabase.auth.getUser();

  const requestData: SupportRequestInsert = {
    ...request,
    user_id: user?.id || null,
  };

  const { data, error } = await supabase
    .from('support_requests')
    .insert(requestData as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create support request: ${error.message}`);
  }

  return data;
}

/**
 * Fetch support requests for the current user
 */
export async function getSupportRequests(): Promise<SupportRequestRow[]> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('support_requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch support requests: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single support request by ID
 */
export async function getSupportRequest(
  id: string
): Promise<SupportRequestRow | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('support_requests')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch support request: ${error.message}`);
  }

  return data;
}

// =====================================================
// Help Center Interaction Functions
// =====================================================

/**
 * Track a help center interaction
 */
export async function trackInteraction(
  interaction: HelpCenterInteractionInsert
): Promise<HelpCenterInteractionRow> {
  const { data: { user } } = await supabase.auth.getUser();

  // Generate session ID if not provided
  let sessionId = interaction.session_id;
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('help_center_session_id', sessionId);
  }

  const interactionData: HelpCenterInteractionInsert = {
    ...interaction,
    user_id: user?.id || null,
    session_id: sessionId,
  };

  const { data, error } = await supabase
    .from('help_center_interactions')
    .insert(interactionData as any)
    .select()
    .single();

  if (error) {
    // Don't throw error for analytics - just log it
    console.error('Failed to track interaction:', error);
    // Return a mock object to prevent breaking the UI
    return {
      id: '',
      user_id: user?.id || null,
      session_id: sessionId,
      interaction_type: interaction.interaction_type,
      section: interaction.section || null,
      faq_id: interaction.faq_id || null,
      search_query: interaction.search_query || null,
      metadata: interaction.metadata || {},
      created_at: new Date().toISOString(),
    } as HelpCenterInteractionRow;
  }

  return data;
}

/**
 * Get or create session ID for anonymous users
 */
export function getHelpCenterSessionId(): string {
  let sessionId = sessionStorage.getItem('help_center_session_id');
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('help_center_session_id', sessionId);
  }
  
  return sessionId;
}
