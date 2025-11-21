import { supabase } from '@/lib/supabase';
import type { Profile, ProfileUpdate } from '@/types/database/profile';
import type { TeamMember, TeamMemberInsert, TeamMemberUpdate } from '@/types/database/team-member';
import type { Subscription, SubscriptionUpdate } from '@/types/database/subscription';
import type { SecuritySettings, SecuritySettingsInsert, SecuritySettingsUpdate } from '@/types/database/security-settings';
import type { NotificationPreference, NotificationPreferenceInsert, NotificationPreferenceUpdate, NotificationAlertType } from '@/types/database/notification-preference';

/**
 * ============================================
 * ACCOUNT OPERATIONS
 * ============================================
 */

/**
 * Update user profile information
 */
export async function updateProfile(data: { name?: string; company?: string | null }): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const updateData: ProfileUpdate = {
    name: data.name,
    company: data.company,
  };

  const { data: profile, error } = await supabase
    .from('profiles')
    // @ts-expect-error - Supabase type inference issue with Database type
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return profile as Profile;
}

/**
 * Get user profile
 */
export async function getProfile(): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile;
}

/**
 * ============================================
 * TEAM OPERATIONS
 * ============================================
 */

/**
 * Get team members for the current user's organization
 */
export async function getTeamMembers() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get team members where user is the organization owner or a member
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .or(`organization_id.eq.${user.id},user_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as TeamMember[];
}

/**
 * Invite a team member
 */
export async function inviteTeamMember(input: { email: string; role: 'admin' | 'member' | 'viewer' }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Generate invite token
  const inviteToken = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  const teamMember: TeamMemberInsert = {
    organization_id: user.id,
    email: input.email,
    role: input.role,
    invite_status: 'pending',
    invite_token: inviteToken,
    invited_by: user.id,
  };

  const { data, error } = await supabase
    .from('team_members')
    // @ts-expect-error - Supabase type inference issue with Database type
    .insert(teamMember)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TeamMember;
}

/**
 * Update team member role
 */
export async function updateTeamMember(memberId: string, updates: TeamMemberUpdate): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    // @ts-expect-error - Supabase type inference issue with Database type
    .update(updates)
    .eq('id', memberId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TeamMember;
}

/**
 * Remove team member
 */
export async function removeTeamMember(memberId: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', memberId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * ============================================
 * BILLING OPERATIONS
 * ============================================
 */

/**
 * Get user subscription
 */
export async function getSubscription() {
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
    // If subscription doesn't exist, return default free plan
    if (error.code === 'PGRST116') {
      return {
        id: '',
        user_id: user.id,
        plan_id: 'free' as const,
        plan_name: 'Free',
        status: 'active' as const,
        billing_cycle: 'monthly' as const,
        cancel_at_period_end: false,
        usage_metadata: {},
        stripe_customer_id: null,
        stripe_subscription_id: null,
        stripe_payment_method_id: null,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Subscription;
    }
    throw new Error(error.message);
  }

  return data as Subscription;
}

/**
 * Update subscription
 */
export async function updateSubscription(updates: SubscriptionUpdate): Promise<Subscription> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('subscriptions')
    // @ts-expect-error - Supabase type inference issue with Database type
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Subscription;
}

/**
 * ============================================
 * SECURITY OPERATIONS
 * ============================================
 */

/**
 * Get security settings
 */
export async function getSecuritySettings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('security_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // If settings don't exist, return defaults
    if (error.code === 'PGRST116') {
      return {
        id: '',
        user_id: user.id,
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null,
        two_factor_verified_at: null,
        sso_enabled: false,
        sso_type: null,
        sso_provider: null,
        sso_provider_id: null,
        sso_metadata: {},
        require_password_change: false,
        last_password_change_at: null,
        password_expires_at: null,
        max_active_sessions: 10,
        session_timeout_minutes: 60,
        security_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as SecuritySettings;
    }
    throw new Error(error.message);
  }

  return data as SecuritySettings;
}

/**
 * Update security settings
 */
export async function updateSecuritySettings(updates: SecuritySettingsUpdate) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if settings exist
  const { data: existing } = await supabase
    .from('security_settings')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('security_settings')
      // @ts-expect-error - Supabase type inference issue with Database type
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as SecuritySettings;
  } else {
    // Create new
    const newSettings: SecuritySettingsInsert = {
      user_id: user.id,
      ...updates,
    };

    const { data, error } = await supabase
      .from('security_settings')
      // @ts-expect-error - Supabase type inference issue with Database type
      .insert(newSettings)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as SecuritySettings;
  }
}

/**
 * Change password
 */
export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Update last password change timestamp
  await updateSecuritySettings({
    last_password_change_at: new Date().toISOString(),
  });
}

/**
 * ============================================
 * NOTIFICATION OPERATIONS
 * ============================================
 */

/**
 * Get all notification preferences for user
 */
export async function getNotificationPreferences() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .order('alert_type', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as NotificationPreference[];
}

/**
 * Get notification preference for a specific alert type
 */
export async function getNotificationPreference(alertType: NotificationAlertType) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .eq('alert_type', alertType)
    .single();

  if (error) {
    // If preference doesn't exist, return default
    if (error.code === 'PGRST116') {
      return {
        id: '',
        user_id: user.id,
        alert_type: alertType,
        enabled: true,
        email_enabled: true,
        in_app_enabled: true,
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as NotificationPreference;
    }
    throw new Error(error.message);
  }

  return data as NotificationPreference;
}

/**
 * Update notification preference
 */
export async function updateNotificationPreference(
  alertType: NotificationAlertType,
  updates: NotificationPreferenceUpdate
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if preference exists
  const { data: existing } = await supabase
    .from('notification_preferences')
    .select('id')
    .eq('user_id', user.id)
    .eq('alert_type', alertType)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('notification_preferences')
      // @ts-expect-error - Supabase type inference issue with Database type
      .update(updates)
      .eq('user_id', user.id)
      .eq('alert_type', alertType)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as NotificationPreference;
  } else {
    // Create new
    const newPreference: NotificationPreferenceInsert = {
      user_id: user.id,
      alert_type: alertType,
      ...updates,
    };

    const { data, error } = await supabase
      .from('notification_preferences')
      // @ts-expect-error - Supabase type inference issue with Database type
      .insert(newPreference)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as NotificationPreference;
  }
}

/**
 * Update multiple notification preferences at once
 */
export async function updateNotificationPreferences(
  preferences: Array<{ alert_type: NotificationAlertType; updates: NotificationPreferenceUpdate }>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const results = await Promise.all(
    preferences.map(({ alert_type, updates }) =>
      updateNotificationPreference(alert_type, updates)
    )
  );

  return results;
}
