import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as validationRulesApi from '@/api/validation-rules';
import type {
  GeneralValidationRuleInsert,
  GeneralValidationRuleUpdate,
} from '@/types/database/general-validation-rule';

// Query keys
export const validationRuleKeys = {
  all: ['validation-rules'] as const,
  lists: () => [...validationRuleKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...validationRuleKeys.lists(), filters] as const,
  details: () => [...validationRuleKeys.all, 'detail'] as const,
  detail: (id: string) => [...validationRuleKeys.details(), id] as const,
  byForm: (formComponent: string, enabledOnly?: boolean) =>
    [...validationRuleKeys.lists(), { formComponent, enabledOnly }] as const,
};

/**
 * Get validation rules
 */
export function useValidationRules(formComponent?: string, enabledOnly = false) {
  return useQuery({
    queryKey: validationRuleKeys.list({ formComponent, enabledOnly }),
    queryFn: () => validationRulesApi.getValidationRules(formComponent, enabledOnly),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get a single validation rule
 */
export function useValidationRule(id: string | undefined) {
  return useQuery({
    queryKey: validationRuleKeys.detail(id || ''),
    queryFn: () => validationRulesApi.getValidationRule(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create validation rule mutation
 */
export function useCreateValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GeneralValidationRuleInsert) =>
      validationRulesApi.createValidationRule(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: validationRuleKeys.lists() });
      toast.success('Validation rule created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create validation rule');
    },
  });
}

/**
 * Update validation rule mutation
 */
export function useUpdateValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: GeneralValidationRuleUpdate }) =>
      validationRulesApi.updateValidationRule(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: validationRuleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: validationRuleKeys.detail(variables.id) });
      toast.success('Validation rule updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update validation rule');
    },
  });
}

/**
 * Delete validation rule mutation
 */
export function useDeleteValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => validationRulesApi.deleteValidationRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: validationRuleKeys.lists() });
      toast.success('Validation rule deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete validation rule');
    },
  });
}

/**
 * Validate a value against rules
 */
export function useValidateValue() {
  return useMutation({
    mutationFn: ({
      formComponent,
      fieldName,
      value,
    }: {
      formComponent: string;
      fieldName: string;
      value: any;
    }) => validationRulesApi.validateValue(formComponent, fieldName, value),
  });
}
