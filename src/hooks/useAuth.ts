import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as authApi from '@/api/auth';
import type { SignInInput, SignUpInput, PasswordResetRequest } from '@/types/auth';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: (userId: string) => [...authKeys.all, 'profile', userId] as const,
};

/**
 * Get current user session
 */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: authApi.getCurrentSession,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

/**
 * Get current user
 */
export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

/**
 * Get user profile
 */
export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: authKeys.profile(userId || ''),
    queryFn: () => userId ? authApi.getUserProfile(userId) : null,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Sign up mutation
 */
export function useSignUp() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignUpInput) => authApi.signUp(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success('Account created! Please check your email to verify your account.');
      navigate('/verify-email');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Signup failed. Please try again.');
    },
  });
}

/**
 * Sign in mutation
 */
export function useSignIn() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignInInput) => authApi.signIn(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    },
  });
}

/**
 * Sign out mutation
 */
export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Logout failed. Please try again.');
    },
  });
}

/**
 * Request password reset mutation
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (input: PasswordResetRequest) => authApi.requestPasswordReset(input),
    onSuccess: () => {
      toast.success('Password reset email sent! Please check your inbox.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send password reset email.');
    },
  });
}

/**
 * Reset password mutation
 */
export function useResetPassword() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => authApi.resetPassword(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success('Password reset successfully!');
      navigate('/login');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password.');
    },
  });
}

/**
 * Sign in with OAuth mutation
 */
export function useSignInWithOAuth() {
  return useMutation({
    mutationFn: (provider: 'google' | 'azure') => authApi.signInWithOAuth(provider),
    onError: (error: Error) => {
      toast.error(error.message || 'OAuth sign in failed. Please try again.');
    },
  });
}

/**
 * Resend verification email mutation
 */
export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: (email?: string) => authApi.resendVerificationEmail(email),
    onSuccess: () => {
      toast.success('Verification email sent! Please check your inbox.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send verification email.');
    },
  });
}

/**
 * Update user email mutation
 */
export function useUpdateUserEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newEmail: string) => authApi.updateUserEmail(newEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success('Email updated! A verification email has been sent to your new address.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update email address.');
    },
  });
}

/**
 * Check email verification status (with polling)
 */
export function useEmailVerificationStatus(enabled: boolean = true) {
  return useQuery({
    queryKey: [...authKeys.all, 'email-verification'],
    queryFn: authApi.checkEmailVerification,
    enabled,
    refetchInterval: (query) => {
      // Poll every 3 seconds if not verified, stop polling if verified
      const data = query.state.data;
      if (!data) return 3000; // Poll if no data yet
      return data.verified ? false : 3000;
    },
    staleTime: 0, // Always check fresh
  });
}
