import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as billingApi from '@/api/billing';
import type { TransactionInsert } from '@/types/database/transaction';

const QUERY_KEYS = {
  all: ['billing'] as const,
  plans: () => [...QUERY_KEYS.all, 'plans'] as const,
  plan: (id: string) => [...QUERY_KEYS.plans(), id] as const,
  planByIdentifier: (planId: string) => [...QUERY_KEYS.plans(), 'identifier', planId] as const,
  transactions: () => [...QUERY_KEYS.all, 'transactions'] as const,
  transaction: (id: string) => [...QUERY_KEYS.transactions(), id] as const,
  invoices: () => [...QUERY_KEYS.all, 'invoices'] as const,
  invoice: (id: string) => [...QUERY_KEYS.invoices(), id] as const,
  invoiceByTransaction: (transactionId: string) => [...QUERY_KEYS.invoices(), 'transaction', transactionId] as const,
};

/**
 * Hook to fetch all active plans
 */
export function usePlans() {
  return useQuery({
    queryKey: QUERY_KEYS.plans(),
    queryFn: () => billingApi.getPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes (plans don't change often)
  });
}

/**
 * Hook to fetch a single plan by ID
 */
export function usePlan(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.plan(id),
    queryFn: () => billingApi.getPlan(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a plan by plan_id identifier
 */
export function usePlanByIdentifier(planId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.planByIdentifier(planId),
    queryFn: () => billingApi.getPlanByIdentifier(planId),
    enabled: !!planId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch all transactions for the current user
 */
export function useTransactions(filters?: {
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'canceled';
  limit?: number;
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.transactions(), filters],
    queryFn: () => billingApi.getTransactions(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single transaction by ID
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.transaction(id),
    queryFn: () => billingApi.getTransaction(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Hook to create a new transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transaction: Omit<TransactionInsert, 'user_id'>) =>
      billingApi.createTransaction(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions() });
      toast.success('Transaction created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create transaction: ${error.message}`);
    },
  });
}

/**
 * Hook to fetch all invoices for the current user
 */
export function useInvoices(filters?: {
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  limit?: number;
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.invoices(), filters],
    queryFn: () => billingApi.getInvoices(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single invoice by ID
 */
export function useInvoice(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.invoice(id),
    queryFn: () => billingApi.getInvoice(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch invoice by transaction ID
 */
export function useInvoiceByTransactionId(transactionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.invoiceByTransaction(transactionId),
    queryFn: () => billingApi.getInvoiceByTransactionId(transactionId),
    enabled: !!transactionId,
    staleTime: 30000,
  });
}

/**
 * Hook to validate a promo code
 */
export function useValidatePromoCode() {
  return useMutation({
    mutationFn: ({ code, planId, amount }: { code: string; planId?: string; amount?: number }) =>
      billingApi.validatePromoCode(code, planId, amount),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to validate promo code');
    },
  });
}

/**
 * Hook to create a Stripe payment intent
 * Note: This requires backend API implementation
 */
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (data: {
      planId: string;
      billingCycle: 'monthly' | 'yearly';
      promoCode?: string;
    }) => billingApi.createPaymentIntent(data),
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create payment intent');
    },
  });
}

/**
 * Hook to confirm payment
 * Note: This requires backend API implementation
 */
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      paymentIntentId: string;
      transactionId: string;
    }) => billingApi.confirmPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoices() });
      toast.success('Payment confirmed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm payment');
    },
  });
}
