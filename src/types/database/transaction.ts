/**
 * Database types for transactions table
 * Generated: 2025-11-21T02:04:48Z
 */

export interface Transaction {
  id: string;
  user_id: string;
  plan_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'canceled';
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_customer_id: string | null;
  billing_cycle: 'monthly' | 'yearly' | null;
  promo_code_id: string | null;
  discount_amount: number;
  final_amount: number;
  metadata: Record<string, any>;
  error_message: string | null;
  error_code: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface TransactionInsert {
  id?: string;
  user_id: string;
  plan_id?: string | null;
  amount: number;
  currency?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'canceled';
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  stripe_customer_id?: string | null;
  billing_cycle?: 'monthly' | 'yearly' | null;
  promo_code_id?: string | null;
  discount_amount?: number;
  final_amount: number;
  metadata?: Record<string, any>;
  error_message?: string | null;
  error_code?: string | null;
  completed_at?: string | null;
}

export interface TransactionUpdate {
  plan_id?: string | null;
  amount?: number;
  currency?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'canceled';
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  stripe_customer_id?: string | null;
  billing_cycle?: 'monthly' | 'yearly' | null;
  promo_code_id?: string | null;
  discount_amount?: number;
  final_amount?: number;
  metadata?: Record<string, any>;
  error_message?: string | null;
  error_code?: string | null;
  completed_at?: string | null;
}

// Supabase query result type
export type TransactionRow = Transaction;
