import { supabase } from '@/lib/supabase';
import type {
  GeneralValidationRule,
  GeneralValidationRuleInsert,
  GeneralValidationRuleUpdate,
} from '@/types/database/general-validation-rule';

/**
 * Get all validation rules for a form/component
 */
export async function getValidationRules(
  formComponent?: string,
  enabledOnly = false
): Promise<GeneralValidationRule[]> {
  let query = supabase
    .from('general_validation_rules')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (formComponent) {
    query = query.eq('form_component', formComponent);
  }

  if (enabledOnly) {
    query = query.eq('enabled', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Get a single validation rule by ID
 */
export async function getValidationRule(id: string): Promise<GeneralValidationRule> {
  const { data, error } = await supabase
    .from('general_validation_rules')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create a new validation rule
 */
export async function createValidationRule(
  input: GeneralValidationRuleInsert
): Promise<GeneralValidationRule> {
  const { data, error } = await supabase
    .from('general_validation_rules')
    // @ts-expect-error - Supabase type inference issue with Database type
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update a validation rule
 */
export async function updateValidationRule(
  id: string,
  updates: GeneralValidationRuleUpdate
): Promise<GeneralValidationRule> {
  const { data, error } = await supabase
    .from('general_validation_rules')
    // @ts-expect-error - Supabase type inference issue with Database type
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a validation rule
 */
export async function deleteValidationRule(id: string): Promise<void> {
  const { error } = await supabase
    .from('general_validation_rules')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Validate a value against rules for a form/component
 */
export async function validateValue(
  formComponent: string,
  fieldName: string,
  value: any
): Promise<{ valid: boolean; errors: string[] }> {
  const rules = await getValidationRules(formComponent, true);

  const fieldRules = rules.filter(
    (rule) => !rule.field_name || rule.field_name === fieldName
  );

  const errors: string[] = [];

  for (const rule of fieldRules) {
    const isValid = validateAgainstRule(rule, value);
    if (!isValid) {
      errors.push(rule.error_message);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Helper function to validate a value against a single rule
 */
function validateAgainstRule(
  rule: GeneralValidationRule,
  value: any
): boolean {
  const { rule_type, validation_criteria } = rule;

  // Handle null/undefined for required rule
  if (rule_type === 'required') {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return false;
    }
    return true;
  }

  // Skip other rules if value is empty (unless required)
  if (value === null || value === undefined || value === '') {
    return true;
  }

  const stringValue = String(value);

  switch (rule_type) {
    case 'min_length':
      return stringValue.length >= (validation_criteria.min || 0);

    case 'max_length':
      return stringValue.length <= (validation_criteria.max || Infinity);

    case 'pattern':
      if (!validation_criteria.pattern) return true;
      try {
        const regex = new RegExp(validation_criteria.pattern);
        return regex.test(stringValue);
      } catch {
        return true; // Invalid regex, skip validation
      }

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(stringValue);

    case 'url':
      try {
        new URL(stringValue);
        return true;
      } catch {
        return false;
      }

    case 'phone':
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      return phoneRegex.test(stringValue) && stringValue.replace(/\D/g, '').length >= 10;

    case 'number':
      return !isNaN(Number(value)) && isFinite(Number(value));

    case 'date':
      const date = new Date(stringValue);
      return !isNaN(date.getTime());

    case 'custom':
      // Custom validation would need to be implemented based on criteria
      return true;

    default:
      return true;
  }
}
