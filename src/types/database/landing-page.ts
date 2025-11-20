/**
 * Database types for landing page tables
 * Generated: 2025-11-21T00:11:26Z
 */

export interface LandingPageTracking {
  id: string;
  session_id: string;
  user_id: string | null;
  referral_source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  user_agent: string | null;
  ip_address: string | null;
  page_views: number;
  time_on_page: number | null;
  scroll_depth: number | null;
  cta_clicks: Array<{
    cta_id: string;
    clicked_at: string;
    section: string;
  }>;
  demo_interactions: number;
  pricing_modal_opens: number;
  conversion_status: 'visitor' | 'signup_clicked' | 'demo_started' | 'converted';
  converted_at: string | null;
  first_visit_at: string;
  last_visit_at: string;
  created_at: string;
  updated_at: string;
}

export interface LandingPageTrackingInsert {
  id?: string;
  session_id: string;
  user_id?: string | null;
  referral_source?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  page_views?: number;
  time_on_page?: number | null;
  scroll_depth?: number | null;
  cta_clicks?: Array<{
    cta_id: string;
    clicked_at: string;
    section: string;
  }>;
  demo_interactions?: number;
  pricing_modal_opens?: number;
  conversion_status?: 'visitor' | 'signup_clicked' | 'demo_started' | 'converted';
  converted_at?: string | null;
  first_visit_at?: string;
  last_visit_at?: string;
}

export interface LandingPageTrackingUpdate {
  page_views?: number;
  time_on_page?: number | null;
  scroll_depth?: number | null;
  cta_clicks?: Array<{
    cta_id: string;
    clicked_at: string;
    section: string;
  }>;
  demo_interactions?: number;
  pricing_modal_opens?: number;
  conversion_status?: 'visitor' | 'signup_clicked' | 'demo_started' | 'converted';
  converted_at?: string | null;
  last_visit_at?: string;
}

export interface LandingPageContent {
  id: string;
  section_key: string;
  content_type: 'text' | 'html' | 'json' | 'image_url' | 'video_url';
  content_value: string;
  metadata: Record<string, any>;
  is_active: boolean;
  display_order: number;
  version: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface LandingPageContentInsert {
  id?: string;
  section_key: string;
  content_type: 'text' | 'html' | 'json' | 'image_url' | 'video_url';
  content_value: string;
  metadata?: Record<string, any>;
  is_active?: boolean;
  display_order?: number;
  version?: number;
  published_at?: string | null;
}

export interface LandingPageContentUpdate {
  content_value?: string;
  metadata?: Record<string, any>;
  is_active?: boolean;
  display_order?: number;
  version?: number;
  published_at?: string | null;
}

// Supabase query result types
export type LandingPageTrackingRow = LandingPageTracking;
export type LandingPageContentRow = LandingPageContent;
