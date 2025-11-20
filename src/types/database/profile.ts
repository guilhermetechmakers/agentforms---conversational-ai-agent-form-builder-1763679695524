/**
 * Database types for profiles table
 * Generated: 2025-11-21T00:19:09Z
 */

export interface Profile {
  id: string;
  name: string;
  company: string | null;
  email_verified: boolean;
  oauth_providers: Array<{
    provider: 'google' | 'microsoft';
    provider_id: string;
    created_at: string;
  }>;
  enterprise_id: string | null;
  sso_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  name: string;
  company?: string | null;
  email_verified?: boolean;
  oauth_providers?: Array<{
    provider: 'google' | 'microsoft';
    provider_id: string;
    created_at: string;
  }>;
  enterprise_id?: string | null;
  sso_enabled?: boolean;
}

export interface ProfileUpdate {
  name?: string;
  company?: string | null;
  email_verified?: boolean;
  oauth_providers?: Array<{
    provider: 'google' | 'microsoft';
    provider_id: string;
    created_at: string;
  }>;
  enterprise_id?: string | null;
  sso_enabled?: boolean;
}

// Supabase query result type
export type ProfileRow = Profile;
