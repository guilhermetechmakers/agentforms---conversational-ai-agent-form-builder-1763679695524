import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useValidationRules,
  useCreateValidationRule,
  useUpdateValidationRule,
  useDeleteValidationRule,
} from '@/hooks/useValidationRules';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Settings,
} from 'lucide-react';
import type { GeneralValidationRule, GeneralValidationRuleType } from '@/types/database/general-validation-rule';

const validationRuleSchema = z.object({
  rule_name: z.string().min(1, 'Rule name is required'),
  rule_description: z.string().optional(),
  form_component: z.string().min(1, 'Form component is required'),
  field_name: z.string().optional(),
  rule_type: z.enum([
    'required',
    'min_length',
    'max_length',
    'pattern',
    'email',
    'url',
    'phone',
    'number',
    'date',
    'custom',
  ]),
  error_message: z.string().min(1, 'Error message is required'),
  enabled: z.boolean().default(true),
  priority: z.number().int().min(0).default(0),
  validation_criteria: z.record(z.any()).default({}),
});

type ValidationRuleFormData = z.infer<typeof validationRuleSchema>;

const RULE_TYPE_OPTIONS: { value: GeneralValidationRuleType; label: string }[] = [
  { value: 'required', label: 'Required' },
  { value: 'min_length', label: 'Minimum Length' },
  { value: 'max_length', label: 'Maximum Length' },
  { value: 'pattern', label: 'Pattern (Regex)' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'custom', label: 'Custom' },
];

const FORM_COMPONENT_OPTIONS = [
  'signup_form',
  'login_form',
  'agent_builder',
  'settings_form',
  'billing_form',
  'webhook_form',
  'other',
];

export function ValidationRuleEditor() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<GeneralValidationRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<GeneralValidationRule | null>(null);
  const [formComponentFilter, setFormComponentFilter] = useState<string>('all');

  const { data: rules, isLoading } = useValidationRules();
  const createMutation = useCreateValidationRule();
  const updateMutation = useUpdateValidationRule();
  const deleteMutation = useDeleteValidationRule();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ValidationRuleFormData>({
    resolver: zodResolver(validationRuleSchema),
    defaultValues: {
      enabled: true,
      priority: 0,
      validation_criteria: {},
    },
  });

  const ruleType = watch('rule_type');

  // Filter rules
  const filteredRules = rules?.filter(
    (rule) => formComponentFilter === 'all' || rule.form_component === formComponentFilter
  ) || [];

  const handleOpenDialog = (rule?: GeneralValidationRule) => {
    if (rule) {
      setEditingRule(rule);
      reset({
        rule_name: rule.rule_name,
        rule_description: rule.rule_description || '',
        form_component: rule.form_component,
        field_name: rule.field_name || '',
        rule_type: rule.rule_type,
        error_message: rule.error_message,
        enabled: rule.enabled,
        priority: rule.priority,
        validation_criteria: rule.validation_criteria,
      });
    } else {
      setEditingRule(null);
      reset({
        enabled: true,
        priority: 0,
        validation_criteria: {},
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRule(null);
    reset();
  };

  const onSubmit = async (data: ValidationRuleFormData) => {
    try {
      if (editingRule) {
        await updateMutation.mutateAsync({
          id: editingRule.id,
          updates: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      handleCloseDialog();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (deletingRule) {
      await deleteMutation.mutateAsync(deletingRule.id);
      setDeletingRule(null);
    }
  };

  const getCriteriaInputs = () => {
    switch (ruleType) {
      case 'min_length':
      case 'max_length':
        return (
            <div className="space-y-2">
              <Label>
                {ruleType === 'min_length' ? 'Minimum Length' : 'Maximum Length'}
              </Label>
              <Input
                type="number"
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : undefined;
                  setValue('validation_criteria', {
                    ...watch('validation_criteria'),
                    [ruleType === 'min_length' ? 'min' : 'max']: value,
                  });
                }}
                defaultValue={
                  ruleType === 'min_length'
                    ? watch('validation_criteria')?.min
                    : watch('validation_criteria')?.max
                }
                placeholder={ruleType === 'min_length' ? 'e.g., 8' : 'e.g., 50'}
              />
            </div>
        );
      case 'pattern':
        return (
            <div className="space-y-2">
              <Label>Regular Expression Pattern</Label>
              <Input
                onChange={(e) => {
                  setValue('validation_criteria', {
                    ...watch('validation_criteria'),
                    pattern: e.target.value,
                  });
                }}
                defaultValue={watch('validation_criteria')?.pattern}
                placeholder="e.g., ^[A-Za-z0-9]+$"
              />
              <p className="text-xs text-muted-foreground">
                Enter a valid JavaScript regular expression pattern
              </p>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Validation Rules
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage validation rules for forms and components
              </p>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <Label>Filter by Form Component:</Label>
            <Select value={formComponentFilter} onValueChange={setFormComponentFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Components</SelectItem>
                {FORM_COMPONENT_OPTIONS.map((component) => (
                  <SelectItem key={component} value={component}>
                    {component}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rules Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading validation rules...</div>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No validation rules found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Rule
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Form Component</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => (
                    <TableRow key={rule.id} className="hover:bg-surface">
                      <TableCell className="font-medium">{rule.rule_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.form_component}</Badge>
                      </TableCell>
                      <TableCell>
                        {rule.field_name ? (
                          <span className="text-sm">{rule.field_name}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{rule.rule_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell>{rule.priority}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingRule(rule)}
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Validation Rule' : 'Create Validation Rule'}
            </DialogTitle>
            <DialogDescription>
              {editingRule
                ? 'Update the validation rule settings'
                : 'Create a new validation rule for forms and components'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule_name">
                  Rule Name <span className="text-danger">*</span>
                </Label>
                <Input
                  id="rule_name"
                  {...register('rule_name')}
                  placeholder="e.g., Email Required"
                />
                {errors.rule_name && (
                  <p className="text-xs text-danger">{errors.rule_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="form_component">
                  Form Component <span className="text-danger">*</span>
                </Label>
                <Select
                  value={watch('form_component')}
                  onValueChange={(value) => setValue('form_component', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select component" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORM_COMPONENT_OPTIONS.map((component) => (
                      <SelectItem key={component} value={component}>
                        {component}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.form_component && (
                  <p className="text-xs text-danger">{errors.form_component.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule_description">Description</Label>
              <Textarea
                id="rule_description"
                {...register('rule_description')}
                placeholder="Optional description of this rule"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field_name">Field Name (Optional)</Label>
                <Input
                  id="field_name"
                  {...register('field_name')}
                  placeholder="e.g., email, password"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to apply to all fields in the form
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule_type">
                  Rule Type <span className="text-danger">*</span>
                </Label>
                <Select
                  value={watch('rule_type')}
                  onValueChange={(value) =>
                    setValue('rule_type', value as GeneralValidationRuleType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RULE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rule_type && (
                  <p className="text-xs text-danger">{errors.rule_type.message}</p>
                )}
              </div>
            </div>

            {getCriteriaInputs()}

            <div className="space-y-2">
              <Label htmlFor="error_message">
                Error Message <span className="text-danger">*</span>
              </Label>
              <Input
                id="error_message"
                {...register('error_message')}
                placeholder="e.g., This field is required"
              />
              {errors.error_message && (
                <p className="text-xs text-danger">{errors.error_message.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  {...register('priority', { valueAsNumber: true })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Higher priority rules are checked first
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="enabled"
                  checked={watch('enabled')}
                  onCheckedChange={(checked) => setValue('enabled', checked)}
                />
                <Label htmlFor="enabled">Enabled</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingRule ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingRule} onOpenChange={() => setDeletingRule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Validation Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingRule?.rule_name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-danger">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
