/**
 * Database types for validation_rules table
 * Generated: 2025-11-21T02:21:09Z
 */

export type ValidationRuleType = 'min' | 'max' | 'pattern' | 'custom' | 'email' | 'url' | 'phone';

export interface ValidationRule {
  id: string;
  field_id: string;
  rule_type: ValidationRuleType;
  parameters: Record<string, any>;
  error_message: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ValidationRuleInsert {
  id?: string;
  field_id: string;
  rule_type: ValidationRuleType;
  parameters?: Record<string, any>;
  error_message?: string | null;
  enabled?: boolean;
}

export interface ValidationRuleUpdate {
  rule_type?: ValidationRuleType;
  parameters?: Record<string, any>;
  error_message?: string | null;
  enabled?: boolean;
}

// Supabase query result type
export type ValidationRuleRow = ValidationRule;
