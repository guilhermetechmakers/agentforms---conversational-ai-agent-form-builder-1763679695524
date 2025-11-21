/**
 * SSO Configuration types
 */

export type SSOProvider = 'saml' | 'oauth' | 'azure' | 'google_workspace' | 'okta' | 'onelogin';

export interface SSOConfiguration {
  id: string;
  organization_id: string;
  provider: SSOProvider;
  provider_name: string;
  settings: SSOSettings;
  enabled: boolean;
  verified: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SSOConfigurationInsert {
  organization_id: string;
  provider: SSOProvider;
  provider_name: string;
  settings: SSOSettings;
  enabled?: boolean;
  verified?: boolean;
  metadata?: Record<string, any>;
}

export interface SSOConfigurationUpdate {
  provider_name?: string;
  settings?: SSOSettings;
  enabled?: boolean;
  verified?: boolean;
  metadata?: Record<string, any>;
}

// SAML Settings
export interface SAMLSettings {
  entity_id: string;
  sso_url: string;
  x509_cert: string;
  attribute_mapping?: {
    email?: string;
    name?: string;
    groups?: string;
  };
}

// OAuth Settings
export interface OAuthSettings {
  client_id: string;
  client_secret: string;
  authorization_url: string;
  token_url: string;
  userinfo_url: string;
  scopes: string[];
}

// Azure AD Settings
export interface AzureSettings {
  tenant_id: string;
  client_id: string;
  client_secret: string;
}

// Union type for all SSO settings
export type SSOSettings = SAMLSettings | OAuthSettings | AzureSettings | Record<string, any>;

// Supabase query result type
export type SSOConfigurationRow = SSOConfiguration;
