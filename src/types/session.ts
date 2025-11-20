export type MessageRole = 'agent' | 'visitor' | 'system';
export type SessionStatus = 'active' | 'completed' | 'abandoned';

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  validationState?: 'valid' | 'invalid' | 'pending';
}

export interface ExtractedField {
  fieldId: string;
  fieldLabel: string;
  value: string | number | boolean;
  sourceMessageId: string;
  confidence: number;
  validated: boolean;
}

export interface Session {
  id: string;
  agentId: string;
  agentName: string;
  status: SessionStatus;
  visitorId?: string;
  ipAddress?: string;
  userAgent?: string;
  gated: boolean;
  createdAt: string;
  completedAt?: string;
  messages: Message[];
  extractedFields: ExtractedField[];
  tags?: string[];
  notes?: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  sessionId: string;
  url: string;
  status: 'pending' | 'success' | 'failed';
  responseCode?: number;
  responseBody?: string;
  attempts: number;
  deliveredAt?: string;
  createdAt: string;
}
