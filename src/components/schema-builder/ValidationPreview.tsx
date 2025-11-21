import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { AgentField } from '@/types/agent';

interface ValidationPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: AgentField[];
}

export function ValidationPreview({
  open,
  onOpenChange,
  fields,
}: ValidationPreviewProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [validationResults, setValidationResults] = useState<Record<string, { valid: boolean; errors: string[] }>>({});

  const handleFieldChange = async (fieldId: string, value: any) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));

    // Validate the field value
    // Note: This requires the database field ID, not the field_id
    // For now, we'll do basic client-side validation
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const errors: string[] = [];

    // Basic validation
    if (field.required && (!value || value.toString().trim() === '')) {
      errors.push('This field is required');
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push('Invalid email format');
      }
    }

    if (field.type === 'number' && value) {
      if (isNaN(Number(value))) {
        errors.push('Must be a valid number');
      }
    }

    setValidationResults((prev) => ({
      ...prev,
      [fieldId]: {
        valid: errors.length === 0,
        errors,
      },
    }));
  };

  const handleValidateAll = () => {
    fields.forEach((field) => {
      const value = fieldValues[field.id];
      handleFieldChange(field.id, value);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Validation Preview</DialogTitle>
          <DialogDescription>
            Test validation rules by entering sample values for each field.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No fields defined. Add fields to test validation.
            </p>
          ) : (
            fields
              .sort((a, b) => a.order - b.order)
              .map((field) => {
                const value = fieldValues[field.id] || '';
                const result = validationResults[field.id];
                const isValid = result ? result.valid : null;

                return (
                  <div key={field.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.id}>
                        {field.label}
                        {field.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>
                      {isValid !== null && (
                        <Badge
                          variant={isValid ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {isValid ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Valid
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Invalid
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                    <Input
                      id={field.id}
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={value}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    />
                    {field.helpText && (
                      <p className="text-xs text-muted-foreground">{field.helpText}</p>
                    )}
                    {result && !result.valid && result.errors.length > 0 && (
                      <div className="space-y-1">
                        {result.errors.map((error, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-destructive"
                          >
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
          )}

          {fields.length > 0 && (
            <div className="pt-4 border-t">
              <Button onClick={handleValidateAll} className="w-full">
                Validate All Fields
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
