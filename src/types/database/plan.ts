/**
 * Database types for plans table
 * Generated: 2025-11-21T02:04:46Z
 */

export interface Plan {
  id: string;
  plan_id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  limits: Record<string, any>;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlanInsert {
  id?: string;
  plan_id: string;
  name: string;
  description?: string | null;
  price_monthly?: number;
  price_yearly?: number;
  currency?: string;
  features?: string[];
  limits?: Record<string, any>;
  stripe_price_id_monthly?: string | null;
  stripe_price_id_yearly?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

export interface PlanUpdate {
  plan_id?: string;
  name?: string;
  description?: string | null;
  price_monthly?: number;
  price_yearly?: number;
  currency?: string;
  features?: string[];
  limits?: Record<string, any>;
  stripe_price_id_monthly?: string | null;
  stripe_price_id_yearly?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

// Supabase query result type
export type PlanRow = Plan;
