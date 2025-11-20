export type FieldType = 'text' | 'number' | 'email' | 'select' | 'date' | 'file';

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string;
}

export interface AgentField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  validation?: FieldValidation;
  options?: string[]; // For select fields
  placeholder?: string;
  helpText?: string;
  piiFlag?: boolean;
  order: number;
}

export interface AgentSchema {
  fields: AgentField[];
}

export interface AgentPersona {
  name: string;
  description: string;
  tone: 'friendly' | 'professional' | 'casual' | 'formal';
  sampleMessages?: string[];
}

export interface AgentKnowledge {
  content: string;
  enableRAG: boolean;
  maxContextTokens?: number;
  citationFlag?: boolean;
}

export interface AgentVisuals {
  primaryColor: string;
  avatarUrl?: string;
  logoUrl?: string;
  welcomeMessage: string;
  customCSS?: string;
}

export interface AgentPublish {
  slug: string;
  publicUrl: string;
  emailOTPEnabled: boolean;
  webhookUrl?: string;
  webhookSecret?: string;
  retentionDays?: number;
}

export interface Agent {
  id: string;
  userId: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  schema: AgentSchema;
  persona: AgentPersona;
  knowledge?: AgentKnowledge;
  visuals: AgentVisuals;
  publish: AgentPublish;
  sessionsCount: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentInput {
  name: string;
  schema: AgentSchema;
  persona: AgentPersona;
  knowledge?: AgentKnowledge;
  visuals: AgentVisuals;
  publish: AgentPublish;
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {
  id: string;
  status?: 'draft' | 'published' | 'archived';
}
