/**
 * Database types for faqs table
 * Generated: 2025-11-21T01:41:17Z
 */

export type FAQCategory = 
  | 'general' 
  | 'getting-started' 
  | 'agents' 
  | 'sessions' 
  | 'webhooks' 
  | 'billing' 
  | 'api' 
  | 'troubleshooting';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  display_order: number;
  is_published: boolean;
  helpful_count: number;
  not_helpful_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface FAQInsert {
  id?: string;
  question: string;
  answer: string;
  category?: FAQCategory;
  display_order?: number;
  is_published?: boolean;
  helpful_count?: number;
  not_helpful_count?: number;
  view_count?: number;
}

export interface FAQUpdate {
  question?: string;
  answer?: string;
  category?: FAQCategory;
  display_order?: number;
  is_published?: boolean;
  helpful_count?: number;
  not_helpful_count?: number;
  view_count?: number;
}

// Supabase query result type
export type FAQRow = FAQ;
