import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import type { AgentField, FieldType } from '@/types/agent';

interface FieldPropertiesPanelProps {
  field: AgentField | null;
  onFieldUpdate: (field: AgentField) => void;
  isLocked: boolean;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'select', label: 'Select' },
  { value: 'date', label: 'Date' },
  { value: 'file', label: 'File' },
];

export function FieldPropertiesPanel({
  field,
  onFieldUpdate,
  isLocked,
}: FieldPropertiesPanelProps) {
  const [formData, setFormData] = useState<Partial<AgentField>>({
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    helpText: '',
    options: [],
    piiFlag: false,
  });

  useEffect(() => {
    if (field) {
      setFormData({
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder || '',
        helpText: field.helpText || '',
        options: field.options || [],
        piiFlag: field.piiFlag || false,
      });
    }
  }, [field]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!field || !formData.label || !formData.type) return;

    const updatedField: AgentField = {
      ...field,
      label: formData.label,
      type: formData.type as FieldType,
      required: formData.required || false,
      placeholder: formData.placeholder,
      helpText: formData.helpText,
      options: formData.type === 'select' ? formData.options : undefined,
      piiFlag: formData.piiFlag || false,
    };

    onFieldUpdate(updatedField);
  };

  if (!field) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Field Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a field to edit its properties.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Field Label *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Full Name, Email Address"
              required
              disabled={isLocked}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Field Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as FieldType })}
              disabled={isLocked}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'select' && (
            <div className="space-y-2">
              <Label htmlFor="options">Options (one per line)</Label>
              <Textarea
                id="options"
                value={formData.options?.join('\n') || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    options: e.target.value.split('\n').filter((o) => o.trim()),
                  })
                }
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={4}
                disabled={isLocked}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder Text</Label>
            <Input
              id="placeholder"
              value={formData.placeholder}
              onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
              placeholder="Enter placeholder text..."
              disabled={isLocked}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="helpText">Help Text</Label>
            <Textarea
              id="helpText"
              value={formData.helpText}
              onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
              placeholder="Additional guidance for users..."
              rows={2}
              disabled={isLocked}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, required: checked as boolean })
              }
              disabled={isLocked}
            />
            <Label htmlFor="required" className="cursor-pointer">
              Required field
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="piiFlag"
              checked={formData.piiFlag}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, piiFlag: checked as boolean })
              }
              disabled={isLocked}
            />
            <Label htmlFor="piiFlag" className="cursor-pointer">
              Contains PII (Personally Identifiable Information)
            </Label>
          </div>

          <Button type="submit" disabled={isLocked} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
