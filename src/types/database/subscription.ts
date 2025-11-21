/**
 * Database types for subscriptions table
 * Generated: 2025-11-21T01:22:24Z
 */

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_payment_method_id: string | null;
  plan_id: 'free' | 'pro' | 'enterprise';
  plan_name: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  usage_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInsert {
  id?: string;
  user_id: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_payment_method_id?: string | null;
  plan_id?: 'free' | 'pro' | 'enterprise';
  plan_name?: string;
  status?: 'active' | 'canceled' | 'past_due' | 'trialing';
  billing_cycle?: 'monthly' | 'yearly';
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  usage_metadata?: Record<string, any>;
}

export interface SubscriptionUpdate {
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_payment_method_id?: string | null;
  plan_id?: 'free' | 'pro' | 'enterprise';
  plan_name?: string;
  status?: 'active' | 'canceled' | 'past_due' | 'trialing';
  billing_cycle?: 'monthly' | 'yearly';
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
  usage_metadata?: Record<string, any>;
}

// Supabase query result type
export type SubscriptionRow = Subscription;
