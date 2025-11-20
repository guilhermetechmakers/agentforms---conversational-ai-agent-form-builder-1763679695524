/**
 * Database type definitions
 * This file aggregates all database types for Supabase
 */

export * from './landing-page';

// Main Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      landing_page_tracking: {
        Row: import('./landing-page').LandingPageTracking;
        Insert: import('./landing-page').LandingPageTrackingInsert;
        Update: import('./landing-page').LandingPageTrackingUpdate;
      };
      landing_page_content: {
        Row: import('./landing-page').LandingPageContent;
        Insert: import('./landing-page').LandingPageContentInsert;
        Update: import('./landing-page').LandingPageContentUpdate;
      };
    };
  };
}
