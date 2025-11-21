/**
 * LLM Service API
 * Handles conversation orchestration, field extraction, and streaming responses
 */

import type { Agent, AgentField, AgentSchema } from '@/types/agent';
import type { MessageRow } from '@/types/database/session';

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

export interface ConversationContext {
  agent: Agent;
  messages: MessageRow[];
  extractedFields: Record<string, string>;
  sessionId: string;
}

export interface LLMResponse {
  content: string;
  extractedFields?: Record<string, {
    value: string;
    confidence: number;
    fieldId: string;
  }>;
  nextFieldId?: string;
  isComplete?: boolean;
}

export interface StreamingLLMResponse {
  content: string;
  done: boolean;
  extractedFields?: Record<string, {
    value: string;
    confidence: number;
    fieldId: string;
  }>;
}

/**
 * Generate agent response using LLM
 * This is a placeholder - in production, this would call an actual LLM API
 */
export async function generateAgentResponse(
  context: ConversationContext,
  userMessage: string,
  _config?: LLMConfig
): Promise<LLMResponse> {
  const { agent, messages, extractedFields } = context;
  
  // Get next required field
  const nextField = getNextRequiredField(extractedFields, agent.schema);
  
  // Build prompt based on agent persona and schema
  const prompt = buildConversationPrompt(agent, messages, userMessage, nextField);
  
  // In production, this would call an actual LLM API
  // For now, we'll simulate a response
  const response = await simulateLLMResponse(prompt, agent, nextField);
  
  return response;
}

/**
 * Generate streaming agent response
 */
export async function* generateStreamingAgentResponse(
  context: ConversationContext,
  userMessage: string,
  _config?: LLMConfig
): AsyncGenerator<StreamingLLMResponse, void, unknown> {
  const { agent, messages, extractedFields } = context;
  
  // Get next required field
  const nextField = getNextRequiredField(extractedFields, agent.schema);
  
  // Build prompt
  const prompt = buildConversationPrompt(agent, messages, userMessage, nextField);
  
  // Simulate streaming response
  const fullResponse = await simulateLLMResponse(prompt, agent, nextField);
  
  // Stream the response word by word
  const words = fullResponse.content.split(' ');
  let accumulatedContent = '';
  
  for (let i = 0; i < words.length; i++) {
    accumulatedContent += (i > 0 ? ' ' : '') + words[i];
    
    yield {
      content: accumulatedContent,
      done: i === words.length - 1,
      extractedFields: i === words.length - 1 ? fullResponse.extractedFields : undefined,
    };
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

/**
 * Extract fields from conversation using LLM
 */
export async function extractFieldsWithLLM(
  messages: MessageRow[],
  schema: AgentSchema,
  _config?: LLMConfig
): Promise<Record<string, {
  value: string;
  confidence: number;
  fieldId: string;
  rawValue: string;
}>> {
  // Build extraction prompt (for future LLM integration)
  // const prompt = buildExtractionPrompt(messages, schema);
  
  // In production, this would call an actual LLM API
  // For now, we'll use enhanced pattern matching
  const extracted = await simulateFieldExtraction(messages, schema);
  
  return extracted;
}

/**
 * Validate field value
 */
export function validateFieldValue(
  value: string,
  field: AgentField
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (field.required && !value.trim()) {
    errors.push(`${field.label} is required`);
  }
  
  if (value.trim()) {
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push('Invalid email format');
        }
        break;
      
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          errors.push('Must be a valid number');
        } else {
          if (field.validation?.min !== undefined && num < field.validation.min) {
            errors.push(`Must be at least ${field.validation.min}`);
          }
          if (field.validation?.max !== undefined && num > field.validation.max) {
            errors.push(`Must be at most ${field.validation.max}`);
          }
        }
        break;
      
      case 'select':
        if (field.options && !field.options.includes(value)) {
          errors.push(`Must be one of: ${field.options.join(', ')}`);
        }
        break;
      
      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push('Invalid date format');
        }
        break;
    }
    
    // Pattern validation
    if (field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        errors.push('Invalid format');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper functions

function buildConversationPrompt(
  agent: Agent,
  messages: MessageRow[],
  userMessage: string,
  nextField: AgentField | null
): string {
  const persona = agent.persona;
  const schema = agent.schema;
  const knowledge = agent.knowledge;
  
  let prompt = `You are ${persona.name}, a conversational AI agent with the following persona:\n`;
  prompt += `${persona.description}\n\n`;
  prompt += `Tone: ${persona.tone}\n\n`;
  
  if (knowledge?.content) {
    prompt += `Context/Knowledge:\n${knowledge.content}\n\n`;
  }
  
  prompt += `Your goal is to collect the following information through conversation:\n`;
  schema.fields.forEach((field) => {
    prompt += `- ${field.label} (${field.type})${field.required ? ' [REQUIRED]' : ''}\n`;
    if (field.helpText) {
      prompt += `  ${field.helpText}\n`;
    }
  });
  
  prompt += `\nConversation so far:\n`;
  messages.forEach((msg) => {
    const role = msg.role === 'agent' ? persona.name : 'User';
    prompt += `${role}: ${msg.content}\n`;
  });
  
  prompt += `\nUser just said: ${userMessage}\n\n`;
  
  if (nextField) {
    prompt += `Next, ask for: ${nextField.label}\n`;
    if (nextField.placeholder) {
      prompt += `Suggested phrasing: ${nextField.placeholder}\n`;
    }
  } else {
    prompt += `All required fields have been collected. Thank the user and ask if there's anything else.\n`;
  }
  
  prompt += `\nRespond naturally in a ${persona.tone} tone. Keep responses concise and conversational.`;
  
  return prompt;
}

// Helper function for future LLM integration
export function buildExtractionPrompt(
  messages: MessageRow[],
  schema: AgentSchema
): string {
  let prompt = `Extract structured data from the following conversation:\n\n`;
  
  prompt += `Fields to extract:\n`;
  schema.fields.forEach((field) => {
    prompt += `- ${field.id}: ${field.label} (${field.type})\n`;
  });
  
  prompt += `\nConversation:\n`;
  messages.forEach((msg) => {
    prompt += `${msg.role}: ${msg.content}\n`;
  });
  
  prompt += `\nReturn a JSON object with field IDs as keys and extracted values. Include confidence scores (0-100).`;
  
  return prompt;
}

async function simulateLLMResponse(
  _prompt: string,
  agent: Agent,
  nextField: AgentField | null
): Promise<LLMResponse> {
  // Simulate LLM processing delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let content: string;
  
  if (nextField) {
    // Ask for the next field
    const tone = agent.persona.tone;
    const fieldLabel = nextField.label.toLowerCase();
    
    if (tone === 'friendly') {
      content = nextField.placeholder || `Hi! Could you please share your ${fieldLabel}?`;
    } else if (tone === 'professional') {
      content = nextField.placeholder || `I'd like to collect your ${fieldLabel}. Could you provide that information?`;
    } else if (tone === 'casual') {
      content = nextField.placeholder || `What's your ${fieldLabel}?`;
    } else {
      content = nextField.placeholder || `Please provide your ${fieldLabel}.`;
    }
    
    if (nextField.helpText) {
      content += ` ${nextField.helpText}`;
    }
  } else {
    // All fields collected
    const tone = agent.persona.tone;
    if (tone === 'friendly') {
      content = 'Thank you so much! I have all the information I need. Is there anything else you\'d like to share?';
    } else if (tone === 'professional') {
      content = 'Thank you. All required information has been collected. Is there anything else I can help you with?';
    } else {
      content = 'Thank you! All required information has been collected.';
    }
  }
  
  return {
    content,
    nextFieldId: nextField?.id,
    isComplete: !nextField,
  };
}

async function simulateFieldExtraction(
  messages: MessageRow[],
  schema: AgentSchema
): Promise<Record<string, {
  value: string;
  confidence: number;
  fieldId: string;
  rawValue: string;
}>> {
  const extracted: Record<string, {
    value: string;
    confidence: number;
    fieldId: string;
    rawValue: string;
  }> = {};
  
  // Enhanced pattern matching
  for (const message of messages) {
    if (message.role !== 'visitor') continue;
    
    const content = message.content;
    
    for (const field of schema.fields) {
      if (extracted[field.id]) continue;
      
      let value: string | null = null;
      let confidence = 0;
      
      switch (field.type) {
        case 'email':
          const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
          if (emailMatch) {
            value = emailMatch[0];
            confidence = 95;
          }
          break;
        
        case 'number':
          const numberMatch = content.match(/\d+(\.\d+)?/);
          if (numberMatch) {
            value = numberMatch[0];
            confidence = 80;
          }
          break;
        
        case 'select':
          if (field.options) {
            const matchedOption = field.options.find(opt =>
              content.toLowerCase().includes(opt.toLowerCase())
            );
            if (matchedOption) {
              value = matchedOption;
              confidence = 90;
            }
          }
          break;
        
        case 'date':
          const dateMatch = content.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/);
          if (dateMatch) {
            value = dateMatch[0];
            confidence = 85;
          }
          break;
        
        case 'text':
          // For text fields, check if the message seems relevant
          const labelWords = field.label.toLowerCase().split(' ');
          const contentLower = content.toLowerCase();
          const matchesLabel = labelWords.some(word => contentLower.includes(word));
          
          if (matchesLabel || content.length > 5) {
            value = content;
            confidence = 70;
          }
          break;
      }
      
      if (value) {
        extracted[field.id] = {
          value,
          confidence,
          fieldId: field.id,
          rawValue: content,
        };
      }
    }
  }
  
  return extracted;
}

function getNextRequiredField(
  extractedFields: Record<string, string>,
  schema: AgentSchema
): AgentField | null {
  const requiredFields = schema.fields
    .filter(f => f.required)
    .sort((a, b) => a.order - b.order);
  
  for (const field of requiredFields) {
    if (!extractedFields[field.id]) {
      return field;
    }
  }
  
  return null;
}
