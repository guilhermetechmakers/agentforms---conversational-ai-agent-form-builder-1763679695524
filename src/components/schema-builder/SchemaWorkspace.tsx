import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  GripVertical, 
  Edit2, 
  Trash2, 
  AlertCircle,
  Type,
  Hash,
  Mail,
  List,
  Calendar,
  File,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentField, FieldType } from '@/types/agent';

interface SchemaWorkspaceProps {
  fields: AgentField[];
  onFieldsChange: (fields: AgentField[]) => void;
  onFieldAdd: (field: AgentField) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldSelect: (fieldId: string | null) => void;
  selectedFieldId: string | null;
  isLocked: boolean;
}

const FIELD_TYPE_ICONS: Record<FieldType, React.ComponentType<{ className?: string }>> = {
  text: Type,
  number: Hash,
  email: Mail,
  select: List,
  date: Calendar,
  file: File,
};

export function SchemaWorkspace({
  fields,
  onFieldsChange,
  onFieldAdd,
  onFieldDelete,
  onFieldSelect,
  selectedFieldId,
  isLocked,
}: SchemaWorkspaceProps) {
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    if (isLocked) return;
    setDraggedFieldId(fieldId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (isLocked || !draggedFieldId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (isLocked || !draggedFieldId) return;
    e.preventDefault();

    const draggedIndex = fields.findIndex(f => f.id === draggedFieldId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedFieldId(null);
      setDragOverIndex(null);
      return;
    }

    const newFields = [...fields];
    const [removed] = newFields.splice(draggedIndex, 1);
    newFields.splice(dropIndex, 0, removed);

    // Update order indices
    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      order: index,
    }));

    onFieldsChange(reorderedFields);
    setDraggedFieldId(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedFieldId(null);
    setDragOverIndex(null);
  };

  const handleAddField = () => {
    const newField: AgentField = {
      id: `field-${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      order: fields.length,
    };
    onFieldAdd(newField);
    onFieldSelect(newField.id);
  };

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Schema Fields</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop to reorder fields
          </p>
        </div>
        <Button 
          onClick={handleAddField} 
          size="sm"
          disabled={isLocked}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      {sortedFields.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No fields defined yet. Add your first field to get started.
            </p>
            <Button onClick={handleAddField} disabled={isLocked}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Field
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sortedFields.map((field, index) => {
            const FieldIcon = FIELD_TYPE_ICONS[field.type];
            const isSelected = selectedFieldId === field.id;
            const isDragging = draggedFieldId === field.id;
            const isDragOver = dragOverIndex === index;

            return (
              <Card
                key={field.id}
                draggable={!isLocked}
                onDragStart={(e) => handleDragStart(e, field.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'transition-all cursor-move',
                  isSelected && 'ring-2 ring-primary',
                  isDragging && 'opacity-50',
                  isDragOver && 'border-primary border-2',
                  !isLocked && 'hover:shadow-md'
                )}
                onClick={() => onFieldSelect(field.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'flex items-center gap-2 flex-1',
                      isLocked && 'cursor-default'
                    )}>
                      {!isLocked && (
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {FieldIcon && <FieldIcon className="h-4 w-4 text-muted-foreground" />}
                          <span className="font-semibold">
                            {field.label || 'Unnamed Field'}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {field.type}
                          </Badge>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                          {field.piiFlag && (
                            <Badge variant="outline" className="text-xs">
                              PII
                            </Badge>
                          )}
                        </div>
                        {field.helpText && (
                          <p className="text-sm text-muted-foreground">{field.helpText}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldSelect(field.id);
                        }}
                        disabled={isLocked}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFieldDelete(field.id);
                        }}
                        disabled={isLocked}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
