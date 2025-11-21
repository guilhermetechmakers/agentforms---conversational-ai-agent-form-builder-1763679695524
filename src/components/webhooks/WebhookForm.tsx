import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateWebhook, useUpdateWebhook } from '@/hooks/useWebhooks';
import { useAgents } from '@/hooks/useAgents';
import type { WebhookRow } from '@/types/database/webhook';

const webhookSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  agent_id: z.string().min(1, 'Agent is required'),
  url: z.string().url('Must be a valid URL').refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'URL must start with http:// or https://',
  }),
  secret: z.string().optional(),
  enabled: z.boolean().default(true),
  triggers: z.array(z.string()).min(1, 'At least one trigger is required'),
  payload_template: z.string().optional(),
  retry_policy: z.object({
    maxAttempts: z.number().min(1).max(10).default(3),
    backoffMultiplier: z.number().min(1).max(10).default(2),
    initialDelay: z.number().min(100).max(60000).default(1000),
  }).optional(),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

const WEBHOOK_TRIGGERS = [
  { value: 'session.completed', label: 'Session Completed' },
  { value: 'session.started', label: 'Session Started' },
  { value: 'field.extracted', label: 'Field Extracted' },
  { value: 'session.abandoned', label: 'Session Abandoned' },
];

interface WebhookFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhook?: WebhookRow | null;
}

export function WebhookForm({ open, onOpenChange, webhook }: WebhookFormProps) {
  const isEditing = !!webhook;
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const { data: agents } = useAgents();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: '',
      agent_id: '',
      url: '',
      secret: '',
      enabled: true,
      triggers: [],
      payload_template: '',
      retry_policy: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
      },
    },
  });

  const selectedTriggers = watch('triggers') || [];

  // Reset form when webhook changes
  useEffect(() => {
    if (webhook) {
      reset({
        name: webhook.name,
        agent_id: webhook.agent_id,
        url: webhook.url,
        secret: webhook.secret || '',
        enabled: webhook.enabled,
        triggers: webhook.triggers || [],
        payload_template: webhook.payload_template
          ? JSON.stringify(webhook.payload_template, null, 2)
          : '',
        retry_policy: webhook.retry_policy || {
          maxAttempts: 3,
          backoffMultiplier: 2,
          initialDelay: 1000,
        },
      });
    } else {
      reset({
        name: '',
        agent_id: '',
        url: '',
        secret: '',
        enabled: true,
        triggers: [],
        payload_template: '',
        retry_policy: {
          maxAttempts: 3,
          backoffMultiplier: 2,
          initialDelay: 1000,
        },
      });
    }
  }, [webhook, reset]);

  const onSubmit = async (data: WebhookFormData) => {
    try {
      let payloadTemplateObj: Record<string, any> | null = null;
      if (data.payload_template) {
        try {
          payloadTemplateObj = JSON.parse(data.payload_template);
        } catch {
          throw new Error('Invalid JSON in payload template');
        }
      }

      const webhookData = {
        name: data.name,
        agent_id: data.agent_id,
        url: data.url,
        secret: data.secret || null,
        enabled: data.enabled,
        triggers: data.triggers,
        payload_template: payloadTemplateObj,
        retry_policy: data.retry_policy || {
          maxAttempts: 3,
          backoffMultiplier: 2,
          initialDelay: 1000,
        },
      };

      if (isEditing && webhook) {
        await updateWebhook.mutateAsync({
          id: webhook.id,
          updates: webhookData,
        });
      } else {
        await createWebhook.mutateAsync(webhookData);
      }

      onOpenChange(false);
    } catch (error: any) {
      // Error is handled by the mutation hooks
      console.error('Failed to save webhook:', error);
    }
  };

  const toggleTrigger = (trigger: string) => {
    const current = selectedTriggers;
    if (current.includes(trigger)) {
      setValue('triggers', current.filter((t) => t !== trigger));
    } else {
      setValue('triggers', [...current, trigger]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Webhook' : 'Create Webhook'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your webhook configuration and settings.'
              : 'Configure a new webhook to receive notifications when events occur.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My Webhook"
              className={errors.name ? 'border-danger' : ''}
            />
            {errors.name && (
              <p className="text-sm text-danger">{errors.name.message}</p>
            )}
          </div>

          {/* Agent */}
          <div className="space-y-2">
            <Label htmlFor="agent_id">Agent</Label>
            <Select
              value={watch('agent_id')}
              onValueChange={(value) => setValue('agent_id', value)}
            >
              <SelectTrigger className={errors.agent_id ? 'border-danger' : ''}>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents?.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.agent_id && (
              <p className="text-sm text-danger">{errors.agent_id.message}</p>
            )}
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">Webhook URL</Label>
            <Input
              id="url"
              type="url"
              {...register('url')}
              placeholder="https://example.com/webhook"
              className={errors.url ? 'border-danger' : ''}
            />
            {errors.url && (
              <p className="text-sm text-danger">{errors.url.message}</p>
            )}
          </div>

          {/* Secret */}
          <div className="space-y-2">
            <Label htmlFor="secret">Secret (Optional)</Label>
            <Input
              id="secret"
              type="password"
              {...register('secret')}
              placeholder="Enter secret for HMAC signing"
            />
            <p className="text-xs text-muted-foreground">
              Used to sign webhook payloads for verification
            </p>
          </div>

          {/* Triggers */}
          <div className="space-y-2">
            <Label>Event Triggers</Label>
            <div className="space-y-2">
              {WEBHOOK_TRIGGERS.map((trigger) => (
                <div key={trigger.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`trigger-${trigger.value}`}
                    checked={selectedTriggers.includes(trigger.value)}
                    onCheckedChange={() => toggleTrigger(trigger.value)}
                  />
                  <Label
                    htmlFor={`trigger-${trigger.value}`}
                    className="font-normal cursor-pointer"
                  >
                    {trigger.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.triggers && (
              <p className="text-sm text-danger">{errors.triggers.message}</p>
            )}
          </div>

          {/* Payload Template */}
          <div className="space-y-2">
            <Label htmlFor="payload_template">Payload Template (Optional)</Label>
            <Textarea
              id="payload_template"
              {...register('payload_template')}
              placeholder='{"event": "{{event}}", "session": "{{session}}", "data": "{{data}}"}'
              className="font-mono text-sm min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Custom JSON template for webhook payload. Use placeholders like <code>{'{{event}}'}</code> for dynamic values.
            </p>
          </div>

          {/* Retry Policy */}
          <div className="space-y-4">
            <Label>Retry Policy</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxAttempts" className="text-sm">
                  Max Attempts
                </Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min={1}
                  max={10}
                  {...register('retry_policy.maxAttempts', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backoffMultiplier" className="text-sm">
                  Backoff Multiplier
                </Label>
                <Input
                  id="backoffMultiplier"
                  type="number"
                  min={1}
                  max={10}
                  step={0.1}
                  {...register('retry_policy.backoffMultiplier', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialDelay" className="text-sm">
                  Initial Delay (ms)
                </Label>
                <Input
                  id="initialDelay"
                  type="number"
                  min={100}
                  max={60000}
                  step={100}
                  {...register('retry_policy.initialDelay', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enabled</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable this webhook
              </p>
            </div>
            <Switch
              id="enabled"
              checked={watch('enabled')}
              onCheckedChange={(checked) => setValue('enabled', checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
