import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Send, 
  ArrowLeft, 
  History, 
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAgent } from '@/hooks/useAgents';
import {
  useSchema,
  useCreateSchema,
  useUpdateSchema,
  usePublishSchema,
  useSchemaFields,
  useCreateField,
  useUpdateField,
  useDeleteField,
  useReorderFields,
  useDraft,
  useSaveDraft,
} from '@/hooks/useSchemaBuilder';
import { useDebounce } from '@/hooks/useDebounce';
import { SchemaWorkspace } from './SchemaWorkspace';
import { FieldPropertiesPanel } from './FieldPropertiesPanel';
import { ValidationPanel } from './ValidationPanel';
import { ConflictResolutionDialog } from './ConflictResolutionDialog';
import { VersionManagementSheet } from './VersionManagementSheet';
import { ValidationPreview } from './ValidationPreview';
import type { AgentField } from '@/types/agent';

export default function SchemaBuilder() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showVersionSheet, setShowVersionSheet] = useState(false);
  const [showValidationPreview, setShowValidationPreview] = useState(false);

  // Fetch agent data
  const { data: agent, isLoading: agentLoading } = useAgent(agentId || '');
  
  // Fetch or create schema
  const [schemaId, setSchemaId] = useState<string | null>(null);
  const { data: schema, isLoading: schemaLoading } = useSchema(schemaId || '');
  const { data: fields = [] } = useSchemaFields(schemaId || '');
  
  // Draft management
  const { data: draft } = useDraft(schemaId, agentId || '');
  const saveDraft = useSaveDraft();

  // Mutations
  const createSchema = useCreateSchema();
  const updateSchema = useUpdateSchema();
  const publishSchema = usePublishSchema();
  const createField = useCreateField();
  const updateField = useUpdateField();
  const deleteField = useDeleteField();
  const reorderFields = useReorderFields();

  // Initialize schema from agent or create new one
  useEffect(() => {
    if (agent && !schemaId) {
      // Check if agent has a schema in the JSONB field
      if (agent.schema && agent.schema.fields && agent.schema.fields.length > 0) {
        // Create a schema record from the agent's schema
        // user_id will be set by the API
        createSchema.mutate({
          agent_id: agent.id,
          name: `${agent.name} Schema`,
          description: 'Schema created from agent configuration',
          user_id: '', // Will be set by API
        } as any, {
          onSuccess: (newSchema) => {
            setSchemaId(newSchema.id);
            // Migrate fields from agent.schema to schema_fields table
            agent.schema.fields.forEach((field, index) => {
              createField.mutate({
                schema_id: newSchema.id,
                field_id: field.id,
                label: field.label,
                type: field.type,
                required: field.required,
                order_index: index,
                placeholder: field.placeholder || null,
                help_text: field.helpText || null,
                options: field.options || null,
                pii_flag: field.piiFlag || false,
              });
            });
          },
        });
      } else {
        // Create a new empty schema
        // user_id will be set by the API
        createSchema.mutate({
          agent_id: agent.id,
          name: `${agent.name} Schema`,
          description: 'New schema',
          user_id: '', // Will be set by API
        } as any, {
          onSuccess: (newSchema) => {
            setSchemaId(newSchema.id);
          },
        });
      }
    }
  }, [agent, schemaId, createSchema, createField]);

  // Convert database fields to AgentField format
  const agentFields: AgentField[] = fields.map(field => ({
    id: field.field_id,
    label: field.label,
    type: field.type,
    required: field.required,
    order: field.order_index,
    placeholder: field.placeholder || undefined,
    helpText: field.help_text || undefined,
    options: field.options || undefined,
    piiFlag: field.pii_flag,
  }));

  // Create a map for quick lookup of database field IDs
  const fieldIdMap = new Map<string, string>();
  fields.forEach(field => {
    fieldIdMap.set(field.field_id, field.id);
  });

  // Autosave draft
  const debouncedFields = useDebounce(agentFields, 2000);
  useEffect(() => {
    if (schemaId && agentId && debouncedFields.length >= 0) {
      const draftContent: AgentField[] = debouncedFields;
      // user_id will be set by the API
      saveDraft.mutate({
        schema_id: schemaId,
        agent_id: agentId,
        content: { fields: draftContent } as any,
        user_id: '', // Will be set by API
      } as any);
    }
  }, [debouncedFields, schemaId, agentId, saveDraft]);

  // Handle field changes
  const handleFieldsChange = useCallback((newFields: AgentField[]) => {
    // Update order indices
    const fieldIds = newFields.map(f => f.id);
    if (schemaId) {
      reorderFields.mutate({ schemaId, fieldIds });
    }
  }, [schemaId, reorderFields]);

  const handleFieldAdd = useCallback((field: AgentField) => {
    if (schemaId) {
      createField.mutate({
        schema_id: schemaId,
        field_id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        order_index: field.order,
        placeholder: field.placeholder || null,
        help_text: field.helpText || null,
        options: field.options || null,
        pii_flag: field.piiFlag || false,
      });
    }
  }, [schemaId, createField]);

  const handleFieldUpdate = useCallback((field: AgentField) => {
    const dbField = fields.find(f => f.field_id === field.id);
    if (dbField && schemaId) {
      updateField.mutate({
        id: dbField.id,
        updates: {
          label: field.label,
          type: field.type,
          required: field.required,
          order_index: field.order,
          placeholder: field.placeholder || null,
          help_text: field.helpText || null,
          options: field.options || null,
          pii_flag: field.piiFlag || false,
        },
      });
    }
  }, [fields, schemaId, updateField]);

  const handleFieldDelete = useCallback((fieldId: string) => {
    const dbFieldId = fieldIdMap.get(fieldId);
    if (dbFieldId && schemaId) {
      deleteField.mutate({ id: dbFieldId, schemaId });
    }
  }, [fieldIdMap, schemaId, deleteField]);

  const handleSave = () => {
    if (schemaId) {
      updateSchema.mutate({
        id: schemaId,
        updates: {
          description: `${agentFields.length} fields configured`,
        },
      });
    }
  };

  const handlePublish = () => {
    if (schemaId) {
      publishSchema.mutate(schemaId, {
        onSuccess: () => {
          // Also update the agent's schema JSONB field
          if (agent) {
            // This would need to be done via the agents API
            toast.success('Schema published successfully');
          }
        },
      });
    }
  };

  if (agentLoading || schemaLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Agent not found</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const hasConflict = draft?.conflict_detected && !draft.conflict_resolved;
  const isPublished = schema?.is_published;
  const isLocked = schema?.is_locked;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{agent.name} - Schema Builder</h1>
                <p className="text-sm text-muted-foreground">
                  {schema?.name || 'New Schema'} {schema && `v${schema.version}`}
                </p>
              </div>
              {isPublished && (
                <Badge variant="default" className="bg-success">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              )}
              {hasConflict && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Conflict Detected
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowVersionSheet(true)}
              >
                <History className="h-4 w-4 mr-2" />
                Versions
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowValidationPreview(true)}
              >
                Preview
              </Button>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isLocked || updateSchema.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isLocked || isPublished || publishSchema.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schema Workspace - Takes 2 columns */}
          <div className="lg:col-span-2">
            <SchemaWorkspace
              fields={agentFields}
              onFieldsChange={handleFieldsChange}
              onFieldAdd={handleFieldAdd}
              onFieldDelete={handleFieldDelete}
              onFieldSelect={setSelectedFieldId}
              selectedFieldId={selectedFieldId}
              isLocked={isLocked || false}
            />
          </div>

          {/* Sidebar - Properties and Validation */}
          <div className="space-y-6">
            {selectedFieldId && (
              <>
                <FieldPropertiesPanel
                  field={agentFields.find(f => f.id === selectedFieldId) || null}
                  onFieldUpdate={handleFieldUpdate}
                  isLocked={isLocked || false}
                />
                <ValidationPanel
                  fieldId={fieldIdMap.get(selectedFieldId) || ''}
                  fieldFieldId={selectedFieldId}
                  schemaId={schemaId || ''}
                />
              </>
            )}
            {!selectedFieldId && (
              <Card>
                <CardHeader>
                  <CardTitle>Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Select a field to edit its properties and validation rules.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Conflict Resolution Dialog */}
      {hasConflict && draft && (
        <ConflictResolutionDialog
          draft={draft}
          currentSchema={schema || null}
          onResolve={() => {
            // Conflict resolved, component will handle it
          }}
        />
      )}

      {/* Version Management Sheet */}
      <VersionManagementSheet
        open={showVersionSheet}
        onOpenChange={setShowVersionSheet}
        agentId={agentId || ''}
        currentSchemaId={schemaId}
      />

      {/* Validation Preview */}
      <ValidationPreview
        open={showValidationPreview}
        onOpenChange={setShowValidationPreview}
        fields={agentFields}
      />
    </div>
  );
}
