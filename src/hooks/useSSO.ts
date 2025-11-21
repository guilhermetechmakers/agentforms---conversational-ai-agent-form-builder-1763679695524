import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as ssoApi from '@/api/sso';
import type {
  SSOConfigurationInsert,
  SSOConfigurationUpdate,
} from '@/types/sso';

// Query keys
export const ssoKeys = {
  all: ['sso'] as const,
  configurations: (organizationId: string) =>
    [...ssoKeys.all, 'configurations', organizationId] as const,
  configuration: (id: string) =>
    [...ssoKeys.all, 'configuration', id] as const,
};

/**
 * Get all SSO configurations for an organization
 */
export function useSSOConfigurations(organizationId: string | undefined) {
  return useQuery({
    queryKey: ssoKeys.configurations(organizationId || ''),
    queryFn: () => ssoApi.getSSOConfigurations(organizationId!),
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get a single SSO configuration
 */
export function useSSOConfiguration(id: string | undefined) {
  return useQuery({
    queryKey: ssoKeys.configuration(id || ''),
    queryFn: () => ssoApi.getSSOConfiguration(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create SSO configuration mutation
 */
export function useCreateSSOConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SSOConfigurationInsert) =>
      ssoApi.createSSOConfiguration(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ssoKeys.configurations(data.organization_id),
      });
      toast.success('SSO configuration created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create SSO configuration');
    },
  });
}

/**
 * Update SSO configuration mutation
 */
export function useUpdateSSOConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: SSOConfigurationUpdate;
    }) => ssoApi.updateSSOConfiguration(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ssoKeys.configuration(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: ssoKeys.configurations(data.organization_id),
      });
      toast.success('SSO configuration updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update SSO configuration');
    },
  });
}

/**
 * Delete SSO configuration mutation
 */
export function useDeleteSSOConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, organizationId: _organizationId }: { id: string; organizationId: string }) => {
      return ssoApi.deleteSSOConfiguration(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ssoKeys.configurations(variables.organizationId),
      });
      toast.success('SSO configuration deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete SSO configuration');
    },
  });
}

/**
 * Verify SSO configuration mutation
 */
export function useVerifySSOConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; organizationId: string }) =>
      ssoApi.verifySSOConfiguration(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ssoKeys.configuration(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: ssoKeys.configurations(data.organization_id),
      });
      toast.success('SSO configuration verified successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify SSO configuration');
    },
  });
}
