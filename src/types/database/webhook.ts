/**
 * Database types for webhooks and webhook_deliveries tables
 * Generated: 2025-11-21T00:34:12Z
 */

export interface Webhook {
  id: string;
  agent_id: string;
  user_id: string;
  name: string;
  url: string;
  secret: string | null;
  enabled: boolean;
  triggers: string[];
  payload_template: Record<string, any> | null;
  retry_policy: {
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  last_delivery_status: string | null;
  last_delivery_at: string | null;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookInsert {
  id?: string;
  agent_id: string;
  user_id?: string; // Added automatically by API
  name: string;
  url: string;
  secret?: string | null;
  enabled?: boolean;
  triggers?: string[];
  payload_template?: Record<string, any> | null;
  retry_policy?: {
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}

export interface WebhookUpdate {
  name?: string;
  url?: string;
  secret?: string | null;
  enabled?: boolean;
  triggers?: string[];
  payload_template?: Record<string, any> | null;
  retry_policy?: {
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  session_id: string | null;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  attempt_number: number;
  max_attempts: number;
  request_url: string;
  request_method: string;
  request_headers: Record<string, any> | null;
  request_body: Record<string, any> | null;
  response_status: number | null;
  response_headers: Record<string, any> | null;
  response_body: string | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface WebhookDeliveryInsert {
  id?: string;
  webhook_id: string;
  session_id?: string | null;
  status?: 'pending' | 'success' | 'failed' | 'retrying';
  attempt_number?: number;
  max_attempts?: number;
  request_url: string;
  request_method?: string;
  request_headers?: Record<string, any> | null;
  request_body?: Record<string, any> | null;
  response_status?: number | null;
  response_headers?: Record<string, any> | null;
  response_body?: string | null;
  error_message?: string | null;
  started_at?: string;
  completed_at?: string | null;
  duration_ms?: number | null;
}

// Supabase query result types
export type WebhookRow = Webhook;
export type WebhookDeliveryRow = WebhookDelivery;
