/**
 * Database types for notification_preferences table
 * Generated: 2025-11-21T01:22:26Z
 */

export type NotificationAlertType =
  | 'session_completed'
  | 'session_failed'
  | 'webhook_failed'
  | 'agent_published'
  | 'team_invite'
  | 'billing_update'
  | 'security_alert'
  | 'weekly_summary'
  | 'monthly_report';

export interface NotificationPreference {
  id: string;
  user_id: string;
  alert_type: NotificationAlertType;
  enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferenceInsert {
  id?: string;
  user_id: string;
  alert_type: NotificationAlertType;
  enabled?: boolean;
  email_enabled?: boolean;
  in_app_enabled?: boolean;
  settings?: Record<string, any>;
}

export interface NotificationPreferenceUpdate {
  enabled?: boolean;
  email_enabled?: boolean;
  in_app_enabled?: boolean;
  settings?: Record<string, any>;
}

// Supabase query result type
export type NotificationPreferenceRow = NotificationPreference;
