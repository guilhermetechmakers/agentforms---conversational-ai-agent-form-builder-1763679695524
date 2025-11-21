/**
 * Database types for promo_codes table
 * Generated: 2025-11-21T02:04:47Z
 */

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  currency: string;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  max_uses: number | null;
  max_uses_per_user: number;
  current_uses: number;
  applicable_plans: string[];
  minimum_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeInsert {
  id?: string;
  code: string;
  description?: string | null;
  discount_type?: 'percentage' | 'fixed';
  discount_value: number;
  currency?: string;
  valid_from?: string;
  valid_until?: string | null;
  is_active?: boolean;
  max_uses?: number | null;
  max_uses_per_user?: number;
  current_uses?: number;
  applicable_plans?: string[];
  minimum_amount?: number | null;
}

export interface PromoCodeUpdate {
  code?: string;
  description?: string | null;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  currency?: string;
  valid_from?: string;
  valid_until?: string | null;
  is_active?: boolean;
  max_uses?: number | null;
  max_uses_per_user?: number;
  current_uses?: number;
  applicable_plans?: string[];
  minimum_amount?: number | null;
}

// Supabase query result type
export type PromoCodeRow = PromoCode;

// Promo code validation result
export interface PromoCodeValidation {
  valid: boolean;
  promo_code?: PromoCode;
  discount_amount?: number;
  error?: string;
}
