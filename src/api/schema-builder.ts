import { supabase } from '@/lib/supabase';
import type {
  AgentSchemaRow,
  AgentSchemaInsert,
  AgentSchemaUpdate,
} from '@/types/database/agent-schema';
import type {
  SchemaFieldRow,
  SchemaFieldInsert,
  SchemaFieldUpdate,
} from '@/types/database/schema-field';
import type {
  ValidationRuleRow,
  ValidationRuleInsert,
  ValidationRuleUpdate,
} from '@/types/database/validation-rule';
import type {
  SchemaDraftRow,
  SchemaDraftInsert,
} from '@/types/database/schema-draft';
import type { AgentSchema } from '@/types/agent';

/**
 * Fetch all schemas for an agent
 */
export async function getAgentSchemas(agentId: string): Promise<AgentSchemaRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('agent_schemas')
    .select('*')
    .eq('agent_id', agentId)
    .eq('user_id', user.id)
    .order('version', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch schemas: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single schema by ID
 */
export async function getSchema(id: string): Promise<AgentSchemaRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('agent_schemas')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch schema: ${error.message}`);
  }

  return data;
}

/**
 * Get the latest published schema for an agent
 */
export async function getLatestPublishedSchema(agentId: string): Promise<AgentSchemaRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('agent_schemas')
    .select('*')
    .eq('agent_id', agentId)
    .eq('user_id', user.id)
    .eq('is_published', true)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch published schema: ${error.message}`);
  }

  return data;
}

/**
 * Create a new schema
 */
export async function createSchema(schema: AgentSchemaInsert): Promise<AgentSchemaRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get the next version number
  const existingSchemas = await getAgentSchemas(schema.agent_id);
  const nextVersion = existingSchemas.length > 0
    ? Math.max(...existingSchemas.map(s => s.version)) + 1
    : 1;

  const schemaTable = supabase.from('agent_schemas') as any;
  const { data, error } = await schemaTable
    .insert({
      ...schema,
      user_id: user.id,
      version: nextVersion,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create schema: ${error.message}`);
  }

  return data;
}

/**
 * Update a schema
 */
export async function updateSchema(id: string, updates: AgentSchemaUpdate): Promise<AgentSchemaRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const schemaTable = supabase.from('agent_schemas') as any;
  const { data, error } = await schemaTable
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update schema: ${error.message}`);
  }

  return data;
}

/**
 * Publish a schema (locks it and marks as published)
 */
export async function publishSchema(id: string): Promise<AgentSchemaRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const schemaTable = supabase.from('agent_schemas') as any;
  const { data, error } = await schemaTable
    .update({
      is_published: true,
      is_locked: true,
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to publish schema: ${error.message}`);
  }

  return data;
}

/**
 * Delete a schema
 */
export async function deleteSchema(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('agent_schemas')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete schema: ${error.message}`);
  }
}

/**
 * Fetch all fields for a schema
 */
export async function getSchemaFields(schemaId: string): Promise<SchemaFieldRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify user owns the schema
  const schema = await getSchema(schemaId);
  if (!schema) {
    throw new Error('Schema not found');
  }

  const { data, error } = await supabase
    .from('schema_fields')
    .select('*')
    .eq('schema_id', schemaId)
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch fields: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a field
 */
export async function createField(field: SchemaFieldInsert): Promise<SchemaFieldRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify user owns the schema
  const schema = await getSchema(field.schema_id);
  if (!schema) {
    throw new Error('Schema not found');
  }

  if (schema.is_locked) {
    throw new Error('Cannot modify locked schema');
  }

  const fieldTable = supabase.from('schema_fields') as any;
  const { data, error } = await fieldTable
    .insert(field)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create field: ${error.message}`);
  }

  return data;
}

/**
 * Update a field
 */
export async function updateField(id: string, updates: SchemaFieldUpdate): Promise<SchemaFieldRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get field to check schema ownership
  const { data: fieldData } = await supabase
    .from('schema_fields')
    .select('schema_id')
    .eq('id', id)
    .single();

  if (!fieldData) {
    throw new Error('Field not found');
  }

  const fieldSchemaId = (fieldData as { schema_id: string }).schema_id;
  const schema = await getSchema(fieldSchemaId);
  if (!schema) {
    throw new Error('Schema not found');
  }

  if (schema.is_locked) {
    throw new Error('Cannot modify locked schema');
  }

  const fieldTable = supabase.from('schema_fields') as any;
  const { data, error } = await fieldTable
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update field: ${error.message}`);
  }

  return data;
}

/**
 * Delete a field
 */
export async function deleteField(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get field to check schema ownership
  const { data: fieldData } = await supabase
    .from('schema_fields')
    .select('schema_id')
    .eq('id', id)
    .single();

  if (!fieldData) {
    throw new Error('Field not found');
  }

  const fieldSchemaId = (fieldData as { schema_id: string }).schema_id;
  const schema = await getSchema(fieldSchemaId);
  if (!schema) {
    throw new Error('Schema not found');
  }

  if (schema.is_locked) {
    throw new Error('Cannot modify locked schema');
  }

  const { error } = await supabase
    .from('schema_fields')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete field: ${error.message}`);
  }
}

/**
 * Reorder fields
 */
export async function reorderFields(schemaId: string, fieldIds: string[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const schema = await getSchema(schemaId);
  if (!schema) {
    throw new Error('Schema not found');
  }

  if (schema.is_locked) {
    throw new Error('Cannot modify locked schema');
  }

  // Update order_index for each field
  const updates = fieldIds.map((fieldId, index) => ({
    id: fieldId,
    order_index: index,
  }));

  for (const update of updates) {
    await updateField(update.id, { order_index: update.order_index });
  }
}

/**
 * Fetch validation rules for a field
 */
export async function getFieldValidationRules(fieldId: string): Promise<ValidationRuleRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('validation_rules')
    .select('*')
    .eq('field_id', fieldId)
    .eq('enabled', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch validation rules: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a validation rule
 */
export async function createValidationRule(rule: ValidationRuleInsert): Promise<ValidationRuleRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const ruleTable = supabase.from('validation_rules') as any;
  const { data, error } = await ruleTable
    .insert(rule)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create validation rule: ${error.message}`);
  }

  return data;
}

/**
 * Update a validation rule
 */
export async function updateValidationRule(
  id: string,
  updates: ValidationRuleUpdate
): Promise<ValidationRuleRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const ruleTable = supabase.from('validation_rules') as any;
  const { data, error } = await ruleTable
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update validation rule: ${error.message}`);
  }

  return data;
}

/**
 * Delete a validation rule
 */
export async function deleteValidationRule(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('validation_rules')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete validation rule: ${error.message}`);
  }
}

/**
 * Validate a field value against its rules
 */
export async function validateFieldValue(
  fieldId: string,
  value: any
): Promise<{ valid: boolean; errors: string[] }> {
  const rules = await getFieldValidationRules(fieldId);
  const errors: string[] = [];

  for (const rule of rules) {
    let isValid = true;
    let errorMessage = rule.error_message || 'Validation failed';

    switch (rule.rule_type) {
      case 'min':
        if (typeof value === 'number' && value < (rule.parameters.min as number)) {
          isValid = false;
        }
        break;
      case 'max':
        if (typeof value === 'number' && value > (rule.parameters.max as number)) {
          isValid = false;
        }
        break;
      case 'pattern':
        if (typeof value === 'string' && rule.parameters.pattern) {
          const regex = new RegExp(rule.parameters.pattern as string);
          if (!regex.test(value)) {
            isValid = false;
          }
        }
        break;
      case 'email':
        if (typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Invalid email format';
          }
        }
        break;
      case 'url':
        if (typeof value === 'string') {
          try {
            new URL(value);
          } catch {
            isValid = false;
            errorMessage = 'Invalid URL format';
          }
        }
        break;
      case 'phone':
        if (typeof value === 'string') {
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Invalid phone number format';
          }
        }
        break;
    }

    if (!isValid) {
      errors.push(errorMessage);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get draft for a schema or agent
 */
export async function getDraft(
  schemaId: string | null,
  agentId: string
): Promise<SchemaDraftRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('schema_drafts')
    .select('*')
    .eq('agent_id', agentId)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (schemaId) {
    query = query.eq('schema_id', schemaId);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch draft: ${error.message}`);
  }

  return data;
}

/**
 * Save or update a draft
 */
export async function saveDraft(draft: SchemaDraftInsert): Promise<SchemaDraftRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check for existing draft
  const existing = await getDraft(draft.schema_id || null, draft.agent_id);

  const draftTable = supabase.from('schema_drafts') as any;
  let result: SchemaDraftRow;

  if (existing) {
    // Update existing draft
    const { data, error } = await draftTable
      .update({
        content: draft.content,
        last_edited_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update draft: ${error.message}`);
    }
    result = data;
  } else {
    // Create new draft
    const { data, error } = await draftTable
      .insert({
        ...draft,
        user_id: user.id,
        last_edited_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create draft: ${error.message}`);
    }
    result = data;
  }

  return result;
}

/**
 * Delete a draft
 */
export async function deleteDraft(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('schema_drafts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete draft: ${error.message}`);
  }
}

/**
 * Resolve a conflict in a draft
 */
export async function resolveDraftConflict(
  draftId: string,
  resolvedContent: AgentSchema
): Promise<SchemaDraftRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const draftTable = supabase.from('schema_drafts') as any;
  const { data, error } = await draftTable
    .update({
      content: resolvedContent,
      conflict_detected: false,
      conflict_resolved: true,
      last_edited_by: user.id,
    })
    .eq('id', draftId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to resolve conflict: ${error.message}`);
  }

  return data;
}
