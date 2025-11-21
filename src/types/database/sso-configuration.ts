/**
 * Database types for sso_configurations table
 * Generated: 2025-11-21T02:00:00Z
 */

export interface SSOConfiguration {
  id: string;
  organization_id: string;
  provider: 'saml' | 'oauth' | 'azure' | 'google_workspace' | 'okta' | 'onelogin';
  provider_name: string;
  settings: Record<string, any>;
  enabled: boolean;
  verified: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SSOConfigurationInsert {
  id?: string;
  organization_id: string;
  provider: 'saml' | 'oauth' | 'azure' | 'google_workspace' | 'okta' | 'onelogin';
  provider_name: string;
  settings: Record<string, any>;
  enabled?: boolean;
  verified?: boolean;
  metadata?: Record<string, any>;
}

export interface SSOConfigurationUpdate {
  provider_name?: string;
  settings?: Record<string, any>;
  enabled?: boolean;
  verified?: boolean;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type SSOConfigurationRow = SSOConfiguration;
