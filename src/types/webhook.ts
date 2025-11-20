export type WebhookTrigger = 'session.completed' | 'session.started' | 'field.extracted';

export interface Webhook {
  id: string;
  agentId: string;
  name: string;
  url: string;
  secret: string;
  triggers: WebhookTrigger[];
  enabled: boolean;
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplier: number;
  };
  lastStatus?: 'success' | 'failed';
  lastDeliveryAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookInput {
  agentId: string;
  name: string;
  url: string;
  secret: string;
  triggers: WebhookTrigger[];
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplier: number;
  };
}

export interface UpdateWebhookInput extends Partial<CreateWebhookInput> {
  id: string;
  enabled?: boolean;
}
