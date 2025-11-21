/**
 * Database types for security_settings table
 * Generated: 2025-11-21T01:22:25Z
 */

export interface SecuritySettings {
  id: string;
  user_id: string;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  two_factor_backup_codes: string[] | null;
  two_factor_verified_at: string | null;
  sso_enabled: boolean;
  sso_type: 'saml' | 'oauth' | 'oidc' | null;
  sso_provider: string | null;
  sso_provider_id: string | null;
  sso_metadata: Record<string, any>;
  require_password_change: boolean;
  last_password_change_at: string | null;
  password_expires_at: string | null;
  max_active_sessions: number;
  session_timeout_minutes: number;
  security_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SecuritySettingsInsert {
  id?: string;
  user_id: string;
  two_factor_enabled?: boolean;
  two_factor_secret?: string | null;
  two_factor_backup_codes?: string[] | null;
  two_factor_verified_at?: string | null;
  sso_enabled?: boolean;
  sso_type?: 'saml' | 'oauth' | 'oidc' | null;
  sso_provider?: string | null;
  sso_provider_id?: string | null;
  sso_metadata?: Record<string, any>;
  require_password_change?: boolean;
  last_password_change_at?: string | null;
  password_expires_at?: string | null;
  max_active_sessions?: number;
  session_timeout_minutes?: number;
  security_metadata?: Record<string, any>;
}

export interface SecuritySettingsUpdate {
  two_factor_enabled?: boolean;
  two_factor_secret?: string | null;
  two_factor_backup_codes?: string[] | null;
  two_factor_verified_at?: string | null;
  sso_enabled?: boolean;
  sso_type?: 'saml' | 'oauth' | 'oidc' | null;
  sso_provider?: string | null;
  sso_provider_id?: string | null;
  sso_metadata?: Record<string, any>;
  require_password_change?: boolean;
  last_password_change_at?: string | null;
  password_expires_at?: string | null;
  max_active_sessions?: number;
  session_timeout_minutes?: number;
  security_metadata?: Record<string, any>;
}

// Supabase query result type
export type SecuritySettingsRow = SecuritySettings;
