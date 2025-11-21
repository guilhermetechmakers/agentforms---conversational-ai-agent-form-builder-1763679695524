/**
 * Database types for general_validation_rules table
 * Generated: 2025-11-21T03:41:29Z
 */

export type GeneralValidationRuleType = 
  | 'required' 
  | 'min_length' 
  | 'max_length' 
  | 'pattern' 
  | 'email' 
  | 'url' 
  | 'phone' 
  | 'number' 
  | 'date' 
  | 'custom';

export interface GeneralValidationRule {
  id: string;
  user_id: string | null;
  rule_name: string;
  rule_description: string | null;
  form_component: string;
  field_name: string | null;
  rule_type: GeneralValidationRuleType;
  validation_criteria: Record<string, any>;
  error_message: string;
  enabled: boolean;
  priority: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GeneralValidationRuleInsert {
  id?: string;
  user_id?: string | null;
  rule_name: string;
  rule_description?: string | null;
  form_component: string;
  field_name?: string | null;
  rule_type: GeneralValidationRuleType;
  validation_criteria?: Record<string, any>;
  error_message: string;
  enabled?: boolean;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface GeneralValidationRuleUpdate {
  rule_name?: string;
  rule_description?: string | null;
  form_component?: string;
  field_name?: string | null;
  rule_type?: GeneralValidationRuleType;
  validation_criteria?: Record<string, any>;
  error_message?: string;
  enabled?: boolean;
  priority?: number;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type GeneralValidationRuleRow = GeneralValidationRule;
