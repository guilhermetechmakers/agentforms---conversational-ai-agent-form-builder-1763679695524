import { supabase } from '@/lib/supabase';
import type {
  SSOConfiguration,
  SSOConfigurationInsert,
  SSOConfigurationUpdate,
} from '@/types/sso';

// Type-safe wrapper for SSO configurations table
const ssoTable = () => supabase.from('sso_configurations' as any);

/**
 * Get all SSO configurations for the current user's organization
 */
export async function getSSOConfigurations(organizationId: string) {
  const { data, error } = await ssoTable()
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as SSOConfiguration[];
}

/**
 * Get a single SSO configuration by ID
 */
export async function getSSOConfiguration(id: string) {
  const { data, error } = await ssoTable()
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SSOConfiguration;
}

/**
 * Create a new SSO configuration
 */
export async function createSSOConfiguration(input: SSOConfigurationInsert) {
  const { data, error } = await ssoTable()
    .insert(input as any)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SSOConfiguration;
}

/**
 * Update an existing SSO configuration
 */
export async function updateSSOConfiguration(
  id: string,
  input: SSOConfigurationUpdate
) {
  const { data, error } = await (ssoTable() as any)
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SSOConfiguration;
}

/**
 * Delete an SSO configuration
 */
export async function deleteSSOConfiguration(id: string) {
  const { error } = await ssoTable()
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Test/verify an SSO configuration
 * This would typically make a test request to the SSO provider
 */
export async function verifySSOConfiguration(id: string) {
  // This is a placeholder - actual implementation would test the SSO connection
  const { data, error } = await (ssoTable() as any)
    .update({ verified: true })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SSOConfiguration;
}
