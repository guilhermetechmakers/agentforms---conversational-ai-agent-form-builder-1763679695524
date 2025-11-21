/**
 * Database types for help_center_interactions table
 * Generated: 2025-11-21T01:41:17Z
 */

export type HelpCenterInteractionType = 
  | 'page_view' 
  | 'section_view' 
  | 'faq_view' 
  | 'faq_feedback' 
  | 'search' 
  | 'form_submit' 
  | 'link_click';

export interface HelpCenterInteraction {
  id: string;
  user_id: string | null;
  session_id: string;
  interaction_type: HelpCenterInteractionType;
  section: string | null;
  faq_id: string | null;
  search_query: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface HelpCenterInteractionInsert {
  id?: string;
  user_id?: string | null;
  session_id: string;
  interaction_type: HelpCenterInteractionType;
  section?: string | null;
  faq_id?: string | null;
  search_query?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type HelpCenterInteractionRow = HelpCenterInteraction;
