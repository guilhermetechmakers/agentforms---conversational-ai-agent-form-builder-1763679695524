import { supabase } from '@/lib/supabase';
import type { SignInInput, SignUpInput, PasswordResetRequest } from '@/types/auth';

/**
 * Sign up a new user with email and password
 */
export async function signUp(input: SignUpInput) {
  const { email, password, name, company } = input;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        company: company || null,
      },
      emailRedirectTo: `${window.location.origin}/verify-email`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // Profile will be created automatically by the trigger
  // But we can update it if it already exists
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        name,
        company: company || null,
      } as any, {
        onConflict: 'id',
      });

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }
  }

  return {
    user: data.user,
    session: data.session,
  };
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(input: SignInInput) {
  const { email, password } = input;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Request a password reset email
 */
export async function requestPasswordReset(input: PasswordResetRequest) {
  const { email } = input;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Reset password with a token
 */
export async function resetPassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Sign in with OAuth provider (Google or Microsoft/Azure)
 */
export async function signInWithOAuth(provider: 'google' | 'azure') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get the current user session
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return user;
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Resend email verification
 */
export async function resendVerificationEmail(email?: string) {
  // Get current user's email if not provided
  let userEmail = email;
  if (!userEmail) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      throw new Error('No email address found. Please provide an email address.');
    }
    userEmail = user.email;
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: userEmail,
    options: {
      emailRedirectTo: `${window.location.origin}/verify-email`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}
