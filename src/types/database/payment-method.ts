/**
 * Database types for payment_methods table
 * Generated: 2025-11-21T03:16:53Z
 */

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  stripe_customer_id: string;
  card_type: string | null;
  card_last_four: string;
  card_brand: string | null;
  expiry_month: number | null;
  expiry_year: number | null;
  billing_name: string | null;
  billing_email: string | null;
  billing_address: Record<string, any> | null;
  is_default: boolean;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodInsert {
  id?: string;
  user_id: string;
  stripe_payment_method_id: string;
  stripe_customer_id: string;
  card_type?: string | null;
  card_last_four: string;
  card_brand?: string | null;
  expiry_month?: number | null;
  expiry_year?: number | null;
  billing_name?: string | null;
  billing_email?: string | null;
  billing_address?: Record<string, any> | null;
  is_default?: boolean;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface PaymentMethodUpdate {
  stripe_payment_method_id?: string;
  stripe_customer_id?: string;
  card_type?: string | null;
  card_last_four?: string;
  card_brand?: string | null;
  expiry_month?: number | null;
  expiry_year?: number | null;
  billing_name?: string | null;
  billing_email?: string | null;
  billing_address?: Record<string, any> | null;
  is_default?: boolean;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type PaymentMethodRow = PaymentMethod;
