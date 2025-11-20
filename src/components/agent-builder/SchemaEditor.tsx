import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Trash2, Edit2, AlertCircle } from "lucide-react";
import type { AgentField, FieldType } from "@/types/agent";

interface SchemaEditorProps {
  fields: AgentField[];
  onChange: (fields: AgentField[]) => void;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "select", label: "Select" },
  { value: "date", label: "Date" },
  { value: "file", label: "File" },
];

export function SchemaEditor({ fields, onChange }: SchemaEditorProps) {
  const [editingField, setEditingField] = useState<AgentField | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddField = () => {
    const newField: AgentField = {
      id: `field-${Date.now()}`,
      label: "",
      type: "text",
      required: false,
      order: fields.length,
      placeholder: "",
      helpText: "",
    };
    setEditingField(newField);
    setIsDialogOpen(true);
  };

  const handleEditField = (field: AgentField) => {
    setEditingField({ ...field });
    setIsDialogOpen(true);
  };

  const handleSaveField = (fieldData: AgentField) => {
    if (editingField?.id && fields.find((f) => f.id === editingField.id)) {
      // Update existing field
      onChange(
        fields.map((f) => (f.id === editingField.id ? fieldData : f))
      );
    } else {
      // Add new field
      onChange([...fields, fieldData]);
    }
    setIsDialogOpen(false);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    onChange(fields.filter((f) => f.id !== fieldId).map((f, index) => ({ ...f, order: index })));
  };

  const handleToggleRequired = (fieldId: string) => {
    onChange(
      fields.map((f) => (f.id === fieldId ? { ...f, required: !f.required } : f))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-h3">Schema Fields</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Define the data fields your agent will collect
          </p>
        </div>
        <Button onClick={handleAddField} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      {fields.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No fields defined yet. Add your first field to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <Card key={field.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{field.label || "Unnamed Field"}</span>
                          <Badge variant={field.required ? "default" : "secondary"}>
                            {field.type}
                          </Badge>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        {field.helpText && (
                          <p className="text-sm text-muted-foreground">{field.helpText}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={field.required}
                        onCheckedChange={() => handleToggleRequired(field.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditField(field)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteField(field.id)}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <FieldEditorDialog
        field={editingField}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingField(null);
        }}
        onSave={handleSaveField}
      />
    </div>
  );
}

interface FieldEditorDialogProps {
  field: AgentField | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: AgentField) => void;
}

function FieldEditorDialog({ field, isOpen, onClose, onSave }: FieldEditorDialogProps) {
  const [formData, setFormData] = useState<Partial<AgentField>>({
    label: "",
    type: "text",
    required: false,
    placeholder: "",
    helpText: "",
    options: [],
    validation: {},
    piiFlag: false,
  });

  React.useEffect(() => {
    if (field) {
      setFormData({
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder || "",
        helpText: field.helpText || "",
        options: field.options || [],
        validation: field.validation || {},
        piiFlag: field.piiFlag || false,
      });
    }
  }, [field]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label || !formData.type) return;

    const fieldData: AgentField = {
      id: field?.id || `field-${Date.now()}`,
      label: formData.label,
      type: formData.type as FieldType,
      required: formData.required || false,
      placeholder: formData.placeholder,
      helpText: formData.helpText,
      options: formData.type === "select" ? formData.options : undefined,
      validation: formData.validation,
      piiFlag: formData.piiFlag,
      order: field?.order || 0,
    };

    onSave(fieldData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{field ? "Edit Field" : "Add Field"}</DialogTitle>
          <DialogDescription>
            Configure the field properties and validation rules
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Field Label *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Full Name, Email Address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Field Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as FieldType })}
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

          {formData.type === "select" && (
            <div className="space-y-2">
              <Label htmlFor="options">Options (one per line)</Label>
              <Textarea
                id="options"
                value={formData.options?.join("\n") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    options: e.target.value.split("\n").filter((o) => o.trim()),
                  })
                }
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={4}
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
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, required: checked as boolean })
              }
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
            />
            <Label htmlFor="piiFlag" className="cursor-pointer">
              Contains PII (Personally Identifiable Information)
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Field</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
