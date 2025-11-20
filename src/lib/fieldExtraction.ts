import type { AgentField, AgentSchema } from '@/types/agent';
import type { MessageRow } from '@/types/database/session';

/**
 * Extract field values from messages
 * This is a simplified version - in production, you'd use an LLM for extraction
 */
export function extractFieldsFromMessages(
  messages: MessageRow[],
  schema: AgentSchema
): Record<string, string> {
  const extracted: Record<string, string> = {};
  const fields = schema.fields || [];

  // Simple extraction based on message patterns
  // In production, this would use an LLM to extract structured data
  for (const message of messages) {
    if (message.role !== 'visitor') continue;

    const content = message.content.toLowerCase();

    // Try to match fields based on labels
    for (const field of fields) {
      if (extracted[field.id]) continue; // Already extracted

      const label = field.label.toLowerCase();

      // Simple pattern matching (very basic - production would use LLM)
      if (field.type === 'email') {
        const emailMatch = message.content.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
          extracted[field.id] = emailMatch[0];
        }
      } else if (field.type === 'number') {
        const numberMatch = message.content.match(/\d+/);
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
      } else if (field.type === 'text' || field.type === 'date') {
        // For text fields, use the message content if it seems relevant
        // This is very simplified - production would use LLM
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
  const completed = requiredFields.filter((f) => extractedFields[f.id]).length;
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
