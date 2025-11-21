import { supabase } from '@/lib/supabase';
import type { PlanRow } from '@/types/database/plan';
import type { TransactionRow, TransactionInsert } from '@/types/database/transaction';
import type { InvoiceRow } from '@/types/database/invoice';
import type { PromoCodeRow, PromoCodeValidation } from '@/types/database/promo-code';
import type { PaymentMethodRow, PaymentMethodInsert, PaymentMethodUpdate } from '@/types/database/payment-method';
import type { SubscriptionRow, SubscriptionUpdate } from '@/types/database/subscription';

/**
 * Fetch all active plans
 */
export async function getPlans(): Promise<PlanRow[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch plans: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single plan by ID
 */
export async function getPlan(id: string): Promise<PlanRow | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch plan: ${error.message}`);
  }

  return data;
}

/**
 * Fetch a plan by plan_id (e.g., 'free', 'pro', 'enterprise')
 */
export async function getPlanByIdentifier(planId: string): Promise<PlanRow | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('plan_id', planId)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch plan: ${error.message}`);
  }

  return data;
}

/**
 * Fetch all transactions for the current user
 */
export async function getTransactions(filters?: {
  status?: TransactionRow['status'];
  limit?: number;
}): Promise<TransactionRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single transaction by ID
 */
export async function getTransaction(id: string): Promise<TransactionRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }

  return data;
}

/**
 * Create a new transaction
 * Note: This should typically be called from the backend after Stripe payment intent creation
 */
export async function createTransaction(transaction: Omit<TransactionInsert, 'user_id'>): Promise<TransactionRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const transactionsTable = supabase.from('transactions') as any;
  const { data, error } = await transactionsTable
    .insert({
      ...transaction,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create transaction: ${error.message}`);
  }

  return data;
}

/**
 * Fetch all invoices for the current user
 */
export async function getInvoices(filters?: {
  status?: InvoiceRow['status'];
  limit?: number;
}): Promise<InvoiceRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('invoice_date', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single invoice by ID
 */
export async function getInvoice(id: string): Promise<InvoiceRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch invoice: ${error.message}`);
  }

  return data;
}

/**
 * Fetch invoice by transaction ID
 */
export async function getInvoiceByTransactionId(transactionId: string): Promise<InvoiceRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('transaction_id', transactionId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch invoice: ${error.message}`);
  }

  return data;
}

/**
 * Validate a promo code
 */
export async function validatePromoCode(
  code: string,
  planId?: string,
  amount?: number
): Promise<PromoCodeValidation> {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return {
      valid: false,
      error: 'Invalid promo code',
    };
  }

  const promoCode = data as PromoCodeRow;

  // Check validity dates
  const now = new Date();
  if (new Date(promoCode.valid_from) > now) {
    return {
      valid: false,
      error: 'Promo code is not yet valid',
    };
  }

  if (promoCode.valid_until && new Date(promoCode.valid_until) < now) {
    return {
      valid: false,
      error: 'Promo code has expired',
    };
  }

  // Check usage limits
  if (promoCode.max_uses !== null && promoCode.current_uses >= promoCode.max_uses) {
    return {
      valid: false,
      error: 'Promo code has reached its usage limit',
    };
  }

  // Check applicable plans
  if (planId && promoCode.applicable_plans.length > 0) {
    if (!promoCode.applicable_plans.includes(planId)) {
      return {
        valid: false,
        error: 'Promo code is not applicable to this plan',
      };
    }
  }

  // Check minimum amount
  if (amount && promoCode.minimum_amount) {
    if (amount < promoCode.minimum_amount) {
      return {
        valid: false,
        error: `Minimum purchase amount of $${promoCode.minimum_amount} required`,
      };
    }
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (amount) {
    if (promoCode.discount_type === 'percentage') {
      discountAmount = (amount * promoCode.discount_value) / 100;
    } else {
      discountAmount = promoCode.discount_value;
    }
  }

  return {
    valid: true,
    promo_code: promoCode,
    discount_amount: discountAmount,
  };
}

/**
 * Create Stripe payment intent
 * Note: This should call a backend API endpoint that creates the payment intent
 * For now, this is a placeholder that would need backend implementation
 */
export async function createPaymentIntent(_data: {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  promoCode?: string;
}): Promise<{ clientSecret: string; paymentIntentId: string }> {
  // This would typically call a backend API endpoint
  // For now, we'll throw an error indicating backend implementation needed
  throw new Error('Payment intent creation requires backend API implementation');
}

/**
 * Confirm payment and create subscription
 * Note: This should call a backend API endpoint that confirms the payment
 */
export async function confirmPayment(_data: {
  paymentIntentId: string;
  transactionId: string;
}): Promise<{ success: boolean; transaction: TransactionRow }> {
  // This would typically call a backend API endpoint
  // For now, we'll throw an error indicating backend implementation needed
  throw new Error('Payment confirmation requires backend API implementation');
}

// =====================================================
// Payment Methods API
// =====================================================

/**
 * Fetch all payment methods for the current user
 */
export async function getPaymentMethods(): Promise<PaymentMethodRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch payment methods: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single payment method by ID
 */
export async function getPaymentMethod(id: string): Promise<PaymentMethodRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch payment method: ${error.message}`);
  }

  return data;
}

/**
 * Create a new payment method
 * Note: This should typically be called after creating a payment method in Stripe
 */
export async function createPaymentMethod(
  paymentMethod: Omit<PaymentMethodInsert, 'user_id'>
): Promise<PaymentMethodRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const paymentMethodsTable = supabase.from('payment_methods') as any;
  const { data, error } = await paymentMethodsTable
    .insert({
      ...paymentMethod,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payment method: ${error.message}`);
  }

  return data;
}

/**
 * Update a payment method
 */
export async function updatePaymentMethod(
  id: string,
  updates: PaymentMethodUpdate
): Promise<PaymentMethodRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const paymentMethodsTable = supabase.from('payment_methods') as any;
  const { data, error } = await paymentMethodsTable
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update payment method: ${error.message}`);
  }

  return data;
}

/**
 * Delete (deactivate) a payment method
 */
export async function deletePaymentMethod(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Soft delete by setting is_active to false
  const paymentMethodsTable = supabase.from('payment_methods') as any;
  const { error } = await paymentMethodsTable
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete payment method: ${error.message}`);
  }
}

/**
 * Set a payment method as default
 */
export async function setDefaultPaymentMethod(id: string): Promise<PaymentMethodRow> {
  return updatePaymentMethod(id, { is_default: true });
}

// =====================================================
// Subscriptions API
// =====================================================

/**
 * Fetch the current user's subscription
 */
export async function getSubscription(): Promise<SubscriptionRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No subscription found
    }
    throw new Error(`Failed to fetch subscription: ${error.message}`);
  }

  return data;
}

/**
 * Update subscription
 * Note: This should typically be called from the backend after Stripe webhook events
 */
export async function updateSubscription(
  updates: SubscriptionUpdate
): Promise<SubscriptionRow> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const subscriptionsTable = supabase.from('subscriptions') as any;
  const { data, error } = await subscriptionsTable
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  return data;
}

/**
 * Cancel subscription (set to cancel at period end)
 */
export async function cancelSubscription(): Promise<SubscriptionRow> {
  return updateSubscription({ cancel_at_period_end: true });
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(): Promise<SubscriptionRow> {
  return updateSubscription({ cancel_at_period_end: false });
}
