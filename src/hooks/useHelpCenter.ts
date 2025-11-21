import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as helpCenterApi from '@/api/help-center';
import type { FAQCategory } from '@/types/database/faq';
import type {
  SupportRequestInsert,
} from '@/types/database/support-request';
import type {
  HelpCenterInteractionInsert,
} from '@/types/database/help-center-interaction';

const QUERY_KEYS = {
  all: ['help-center'] as const,
  faqs: () => [...QUERY_KEYS.all, 'faqs'] as const,
  faqsList: (category?: FAQCategory) => [...QUERY_KEYS.faqs(), category] as const,
  faq: (id: string) => [...QUERY_KEYS.faqs(), id] as const,
  faqsSearch: (query: string) => [...QUERY_KEYS.faqs(), 'search', query] as const,
  supportRequests: () => [...QUERY_KEYS.all, 'support-requests'] as const,
  supportRequest: (id: string) => [...QUERY_KEYS.supportRequests(), id] as const,
};

/**
 * Hook to fetch FAQs, optionally filtered by category
 */
export function useFAQs(category?: FAQCategory) {
  return useQuery({
    queryKey: QUERY_KEYS.faqsList(category),
    queryFn: () => helpCenterApi.getFAQs(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search FAQs
 */
export function useSearchFAQs(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.faqsSearch(query),
    queryFn: () => helpCenterApi.searchFAQs(query),
    enabled: query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single FAQ by ID
 */
export function useFAQ(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.faq(id),
    queryFn: () => helpCenterApi.getFAQ(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to increment FAQ view count
 */
export function useIncrementFAQView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => helpCenterApi.incrementFAQView(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.faq(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.faqs() });
    },
  });
}

/**
 * Hook to submit FAQ feedback
 */
export function useSubmitFAQFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isHelpful }: { id: string; isHelpful: boolean }) =>
      helpCenterApi.submitFAQFeedback(id, isHelpful),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.faq(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.faqs() });
      toast.success('Thank you for your feedback!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit feedback: ${error.message}`);
    },
  });
}

/**
 * Hook to create a support request
 */
export function useCreateSupportRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SupportRequestInsert) =>
      helpCenterApi.createSupportRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.supportRequests() });
      toast.success('Support request submitted successfully! We\'ll get back to you soon.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit support request: ${error.message}`);
    },
  });
}

/**
 * Hook to fetch support requests for the current user
 */
export function useSupportRequests() {
  return useQuery({
    queryKey: QUERY_KEYS.supportRequests(),
    queryFn: () => helpCenterApi.getSupportRequests(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch a single support request
 */
export function useSupportRequest(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.supportRequest(id),
    queryFn: () => helpCenterApi.getSupportRequest(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to track help center interactions
 */
export function useTrackInteraction() {
  return useMutation({
    mutationFn: (interaction: HelpCenterInteractionInsert) =>
      helpCenterApi.trackInteraction(interaction),
    // Don't show toast for analytics tracking
    onError: (error: Error) => {
      console.error('Failed to track interaction:', error);
    },
  });
}
