/**
 * Database types for schema_fields table
 * Generated: 2025-11-21T02:21:09Z
 */

export interface SchemaField {
  id: string;
  schema_id: string;
  field_id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'date' | 'file';
  required: boolean;
  order_index: number;
  placeholder: string | null;
  help_text: string | null;
  options: string[] | null;
  pii_flag: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchemaFieldInsert {
  id?: string;
  schema_id: string;
  field_id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'date' | 'file';
  required?: boolean;
  order_index: number;
  placeholder?: string | null;
  help_text?: string | null;
  options?: string[] | null;
  pii_flag?: boolean;
}

export interface SchemaFieldUpdate {
  field_id?: string;
  label?: string;
  type?: 'text' | 'number' | 'email' | 'select' | 'date' | 'file';
  required?: boolean;
  order_index?: number;
  placeholder?: string | null;
  help_text?: string | null;
  options?: string[] | null;
  pii_flag?: boolean;
}

// Supabase query result type
export type SchemaFieldRow = SchemaField;
