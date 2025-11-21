import type { AgentField, AgentSchema } from '@/types/agent';
import type { MessageRow } from '@/types/database/session';
import { extractFieldsWithLLM, validateFieldValue } from '@/api/llm';

/**
 * Extract field values from messages using LLM
 */
export async function extractFieldsFromMessages(
  messages: MessageRow[],
  schema: AgentSchema
): Promise<Record<string, string>> {
  // Use LLM for extraction if available, otherwise fall back to pattern matching
  try {
    const extracted = await extractFieldsWithLLM(messages, schema);
    const result: Record<string, string> = {};
    
    Object.values(extracted).forEach((field) => {
      if (field.confidence >= 70) {
        result[field.fieldId] = field.value;
      }
    });
    
    return result;
  } catch (error) {
    console.warn('LLM extraction failed, using fallback:', error);
    return extractFieldsFromMessagesFallback(messages, schema);
  }
}

/**
 * Fallback extraction using pattern matching
 */
function extractFieldsFromMessagesFallback(
  messages: MessageRow[],
  schema: AgentSchema
): Record<string, string> {
  const extracted: Record<string, string> = {};
  const fields = schema.fields || [];

  // Simple extraction based on message patterns
  for (const message of messages) {
    if (message.role !== 'visitor') continue;

    const content = message.content.toLowerCase();

    // Try to match fields based on labels
    for (const field of fields) {
      if (extracted[field.id]) continue; // Already extracted

      const label = field.label.toLowerCase();

      // Simple pattern matching
      if (field.type === 'email') {
        const emailMatch = message.content.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
          extracted[field.id] = emailMatch[0];
        }
      } else if (field.type === 'number') {
        const numberMatch = message.content.match(/\d+(\.\d+)?/);
        if (numberMatch) {
          extracted[field.id] = numberMatch[0];
        }
      } else if (field.type === 'select' && field.options) {
        // Check if message contains one of the options
        const matchedOption = field.options.find((opt) =>
          content.includes(opt.toLowerCase())
        );
        if (matchedOption) {
          extracted[field.id] = matchedOption;
        }
      } else if (field.type === 'date') {
        const dateMatch = message.content.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/);
        if (dateMatch) {
          extracted[field.id] = dateMatch[0];
        }
      } else if (field.type === 'text') {
        // For text fields, use the message content if it seems relevant
        if (content.includes(label) || label.includes('name') || label.includes('message')) {
          extracted[field.id] = message.content;
        }
      }
    }
  }

  return extracted;
}

/**
 * Calculate completion rate based on extracted fields
 */
export function calculateCompletionRate(
  extractedFields: Record<string, string>,
  schema: AgentSchema
): { completed: number; total: number; rate: number } {
  const requiredFields = schema.fields?.filter((f) => f.required) || [];
  const total = requiredFields.length;
  
  // Validate extracted fields
  let completed = 0;
  for (const field of requiredFields) {
    const value = extractedFields[field.id];
    if (value) {
      const validation = validateFieldValue(value, field);
      if (validation.isValid) {
        completed++;
      }
    }
  }
  
  const rate = total > 0 ? (completed / total) * 100 : 0;

  return { completed, total, rate };
}

/**
 * Get next required field that hasn't been completed
 */
export function getNextRequiredField(
  extractedFields: Record<string, string>,
  schema: AgentSchema
): AgentField | null {
  const requiredFields = schema.fields?.filter((f) => f.required) || [];
  
  for (const field of requiredFields) {
    if (!extractedFields[field.id]) {
      return field;
    }
  }

  return null;
}
