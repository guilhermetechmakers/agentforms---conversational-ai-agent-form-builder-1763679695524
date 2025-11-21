import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as schemaBuilderApi from '@/api/schema-builder';
import type {
  AgentSchemaInsert,
  AgentSchemaUpdate,
} from '@/types/database/agent-schema';
import type {
  SchemaFieldInsert,
  SchemaFieldUpdate,
} from '@/types/database/schema-field';
import type {
  ValidationRuleInsert,
  ValidationRuleUpdate,
} from '@/types/database/validation-rule';
import type {
  SchemaDraftInsert,
} from '@/types/database/schema-draft';
import type { AgentSchema } from '@/types/agent';

const QUERY_KEYS = {
  all: ['schema-builder'] as const,
  schemas: () => [...QUERY_KEYS.all, 'schemas'] as const,
  schemaList: (agentId: string) => [...QUERY_KEYS.schemas(), 'list', agentId] as const,
  schema: (id: string) => [...QUERY_KEYS.schemas(), 'detail', id] as const,
  publishedSchema: (agentId: string) => [...QUERY_KEYS.schemas(), 'published', agentId] as const,
  fields: () => [...QUERY_KEYS.all, 'fields'] as const,
  fieldList: (schemaId: string) => [...QUERY_KEYS.fields(), 'list', schemaId] as const,
  validationRules: () => [...QUERY_KEYS.all, 'validation-rules'] as const,
  fieldRules: (fieldId: string) => [...QUERY_KEYS.validationRules(), fieldId] as const,
  drafts: () => [...QUERY_KEYS.all, 'drafts'] as const,
  draft: (schemaId: string | null, agentId: string) => 
    [...QUERY_KEYS.drafts(), schemaId || 'new', agentId] as const,
};

/**
 * Hook to fetch all schemas for an agent
 */
export function useAgentSchemas(agentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.schemaList(agentId),
    queryFn: () => schemaBuilderApi.getAgentSchemas(agentId),
    enabled: !!agentId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single schema by ID
 */
export function useSchema(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.schema(id),
    queryFn: () => schemaBuilderApi.getSchema(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch the latest published schema for an agent
 */
export function useLatestPublishedSchema(agentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.publishedSchema(agentId),
    queryFn: () => schemaBuilderApi.getLatestPublishedSchema(agentId),
    enabled: !!agentId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to create a new schema
 */
export function useCreateSchema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schema: AgentSchemaInsert) => schemaBuilderApi.createSchema(schema),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schemaList(data.agent_id) });
      toast.success('Schema created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create schema: ${error.message}`);
    },
  });
}

/**
 * Hook to update a schema
 */
export function useUpdateSchema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: AgentSchemaUpdate }) =>
      schemaBuilderApi.updateSchema(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schema(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schemaList(data.agent_id) });
      toast.success('Schema updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update schema: ${error.message}`);
    },
  });
}

/**
 * Hook to publish a schema
 */
export function usePublishSchema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schemaBuilderApi.publishSchema(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schema(data.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schemaList(data.agent_id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.publishedSchema(data.agent_id) });
      toast.success('Schema published successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish schema: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a schema
 */
export function useDeleteSchema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schemaBuilderApi.deleteSchema(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schemas() });
      toast.success('Schema deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete schema: ${error.message}`);
    },
  });
}

/**
 * Hook to fetch all fields for a schema
 */
export function useSchemaFields(schemaId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.fieldList(schemaId),
    queryFn: () => schemaBuilderApi.getSchemaFields(schemaId),
    enabled: !!schemaId,
    staleTime: 30000,
  });
}

/**
 * Hook to create a field
 */
export function useCreateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (field: SchemaFieldInsert) => schemaBuilderApi.createField(field),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fieldList(data.schema_id) });
      toast.success('Field created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create field: ${error.message}`);
    },
  });
}

/**
 * Hook to update a field
 */
export function useUpdateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SchemaFieldUpdate }) =>
      schemaBuilderApi.updateField(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fieldList(data.schema_id) });
      toast.success('Field updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update field: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a field
 */
export function useDeleteField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; schemaId: string }) => 
      schemaBuilderApi.deleteField(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fieldList(variables.schemaId) });
      toast.success('Field deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete field: ${error.message}`);
    },
  });
}

/**
 * Hook to reorder fields
 */
export function useReorderFields() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ schemaId, fieldIds }: { schemaId: string; fieldIds: string[] }) =>
      schemaBuilderApi.reorderFields(schemaId, fieldIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fieldList(variables.schemaId) });
      toast.success('Fields reordered successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reorder fields: ${error.message}`);
    },
  });
}

/**
 * Hook to fetch validation rules for a field
 */
export function useFieldValidationRules(fieldId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.fieldRules(fieldId),
    queryFn: () => schemaBuilderApi.getFieldValidationRules(fieldId),
    enabled: !!fieldId,
    staleTime: 30000,
  });
}

/**
 * Hook to create a validation rule
 */
export function useCreateValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: ValidationRuleInsert) => schemaBuilderApi.createValidationRule(rule),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fieldRules(data.field_id) });
      toast.success('Validation rule created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create validation rule: ${error.message}`);
    },
  });
}

/**
 * Hook to update a validation rule
 */
export function useUpdateValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ValidationRuleUpdate }) =>
      schemaBuilderApi.updateValidationRule(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fieldRules(data.field_id) });
      toast.success('Validation rule updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update validation rule: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a validation rule
 */
export function useDeleteValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; fieldId: string }) => 
      schemaBuilderApi.deleteValidationRule(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fieldRules(variables.fieldId) });
      toast.success('Validation rule deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete validation rule: ${error.message}`);
    },
  });
}

/**
 * Hook to validate a field value
 */
export function useValidateFieldValue() {
  return useMutation({
    mutationFn: ({ fieldId, value }: { fieldId: string; value: any }) =>
      schemaBuilderApi.validateFieldValue(fieldId, value),
  });
}

/**
 * Hook to fetch a draft
 */
export function useDraft(schemaId: string | null, agentId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.draft(schemaId, agentId),
    queryFn: () => schemaBuilderApi.getDraft(schemaId, agentId),
    enabled: !!agentId,
    staleTime: 10000, // 10 seconds (drafts change frequently)
  });
}

/**
 * Hook to save a draft
 */
export function useSaveDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: SchemaDraftInsert) => schemaBuilderApi.saveDraft(draft),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.draft(data.schema_id, data.agent_id) 
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to save draft: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a draft
 */
export function useDeleteDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schemaBuilderApi.deleteDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.drafts() });
      toast.success('Draft deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete draft: ${error.message}`);
    },
  });
}

/**
 * Hook to resolve a draft conflict
 */
export function useResolveDraftConflict() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draftId, resolvedContent }: { draftId: string; resolvedContent: AgentSchema }) =>
      schemaBuilderApi.resolveDraftConflict(draftId, resolvedContent),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.draft(data.schema_id, data.agent_id) 
      });
      toast.success('Conflict resolved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to resolve conflict: ${error.message}`);
    },
  });
}
