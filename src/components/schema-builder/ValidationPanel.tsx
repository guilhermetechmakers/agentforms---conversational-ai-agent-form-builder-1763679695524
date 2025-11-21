import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useFieldValidationRules, useCreateValidationRule } from '@/hooks/useSchemaBuilder';
// ValidationRuleEditor is defined inline below

interface ValidationPanelProps {
  fieldId: string; // Database field ID
  fieldFieldId?: string; // Field field_id (for display)
  schemaId?: string;
}

export function ValidationPanel({ fieldId }: ValidationPanelProps) {
  const { data: rules = [], isLoading } = useFieldValidationRules(fieldId);
  const createRule = useCreateValidationRule();

  const handleAddRule = () => {
    createRule.mutate({
      field_id: fieldId, // Database field ID
      rule_type: 'min',
      parameters: {},
      error_message: 'Validation failed',
      enabled: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Validation Rules</CardTitle>
          <Button size="sm" onClick={handleAddRule}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading rules...</p>
        ) : rules.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              No validation rules defined for this field.
            </p>
            <Button size="sm" variant="outline" onClick={handleAddRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Rule
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <ValidationRuleEditor key={rule.id} rule={rule} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const ValidationRuleEditor = ({ rule }: { rule: any }) => {
  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">{rule.rule_type}</p>
          {rule.error_message && (
            <p className="text-xs text-muted-foreground">{rule.error_message}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {rule.enabled ? (
            <span className="text-xs text-success">Enabled</span>
          ) : (
            <span className="text-xs text-muted-foreground">Disabled</span>
          )}
        </div>
      </div>
    </div>
  );
};
