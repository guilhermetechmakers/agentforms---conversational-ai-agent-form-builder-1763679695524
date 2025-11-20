/**
 * Database type definitions
 * This file aggregates all database types for Supabase
 */

export * from './landing-page';
export * from './profile';
export * from './agent';
export * from './session';
export * from './webhook';

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
      profiles: {
        Row: import('./profile').Profile;
        Insert: import('./profile').ProfileInsert;
        Update: import('./profile').ProfileUpdate;
      };
      agents: {
        Row: import('./agent').Agent;
        Insert: import('./agent').AgentInsert;
        Update: import('./agent').AgentUpdate;
      };
      sessions: {
        Row: import('./session').Session;
        Insert: import('./session').SessionInsert;
        Update: import('./session').SessionUpdate;
      };
      messages: {
        Row: import('./session').Message;
        Insert: import('./session').MessageInsert;
        Update: never;
      };
      extracted_fields: {
        Row: import('./session').ExtractedField;
        Insert: import('./session').ExtractedFieldInsert;
        Update: never;
      };
      webhooks: {
        Row: import('./webhook').Webhook;
        Insert: import('./webhook').WebhookInsert;
        Update: import('./webhook').WebhookUpdate;
      };
      webhook_deliveries: {
        Row: import('./webhook').WebhookDelivery;
        Insert: import('./webhook').WebhookDeliveryInsert;
        Update: never;
      };
    };
  };
}
