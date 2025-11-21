import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as settingsApi from '@/api/settings';
import type { Profile } from '@/types/database/profile';
import type { TeamMemberUpdate } from '@/types/database/team-member';
import type { SubscriptionUpdate } from '@/types/database/subscription';
import type { SecuritySettingsUpdate } from '@/types/database/security-settings';
import type { NotificationPreferenceUpdate, NotificationAlertType } from '@/types/database/notification-preference';

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  team: () => [...settingsKeys.all, 'team'] as const,
  subscription: () => [...settingsKeys.all, 'subscription'] as const,
  security: () => [...settingsKeys.all, 'security'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
};

/**
 * ============================================
 * PROFILE HOOKS
 * ============================================
 */

/**
 * Get user profile
 */
export function useProfile() {
  return useQuery<Profile>({
    queryKey: settingsKeys.profile(),
    queryFn: settingsApi.getProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Update profile mutation
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; company?: string | null }) =>
      settingsApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

/**
 * ============================================
 * TEAM HOOKS
 * ============================================
 */

/**
 * Get team members
 */
export function useTeamMembers() {
  return useQuery({
    queryKey: settingsKeys.team(),
    queryFn: settingsApi.getTeamMembers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Invite team member mutation
 */
export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; role: 'admin' | 'member' | 'viewer' }) =>
      settingsApi.inviteTeamMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.team() });
      toast.success('Team member invitation sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to invite team member');
    },
  });
}

/**
 * Update team member mutation
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, updates }: { memberId: string; updates: TeamMemberUpdate }) =>
      settingsApi.updateTeamMember(memberId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.team() });
      toast.success('Team member updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update team member');
    },
  });
}

/**
 * Remove team member mutation
 */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => settingsApi.removeTeamMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.team() });
      toast.success('Team member removed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove team member');
    },
  });
}

/**
 * ============================================
 * BILLING HOOKS
 * ============================================
 */

/**
 * Get subscription
 */
export function useSubscription() {
  return useQuery({
    queryKey: settingsKeys.subscription(),
    queryFn: settingsApi.getSubscription,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Update subscription mutation
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: SubscriptionUpdate) => settingsApi.updateSubscription(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.subscription() });
      toast.success('Subscription updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subscription');
    },
  });
}

/**
 * ============================================
 * SECURITY HOOKS
 * ============================================
 */

/**
 * Get security settings
 */
export function useSecuritySettings() {
  return useQuery({
    queryKey: settingsKeys.security(),
    queryFn: settingsApi.getSecuritySettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Update security settings mutation
 */
export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: SecuritySettingsUpdate) =>
      settingsApi.updateSecuritySettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security() });
      toast.success('Security settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update security settings');
    },
  });
}

/**
 * Change password mutation
 */
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPassword: string) => settingsApi.changePassword(newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.security() });
      toast.success('Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });
}

/**
 * ============================================
 * NOTIFICATION HOOKS
 * ============================================
 */

/**
 * Get notification preferences
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: settingsApi.getNotificationPreferences,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get notification preference for specific alert type
 */
export function useNotificationPreference(alertType: NotificationAlertType) {
  return useQuery({
    queryKey: [...settingsKeys.notifications(), alertType],
    queryFn: () => settingsApi.getNotificationPreference(alertType),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Update notification preference mutation
 */
export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      alertType,
      updates,
    }: {
      alertType: NotificationAlertType;
      updates: NotificationPreferenceUpdate;
    }) => settingsApi.updateNotificationPreference(alertType, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() });
      toast.success('Notification preference updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update notification preference');
    },
  });
}

/**
 * Update multiple notification preferences mutation
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Array<{ alert_type: NotificationAlertType; updates: NotificationPreferenceUpdate }>) =>
      settingsApi.updateNotificationPreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() });
      toast.success('Notification preferences updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update notification preferences');
    },
  });
}
