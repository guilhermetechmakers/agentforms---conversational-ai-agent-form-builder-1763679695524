import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Trash2,
  TestTube,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { useToggleWebhook, useDeleteWebhook, useTestWebhook } from '@/hooks/useWebhooks';
import { formatDistanceToNow } from 'date-fns';
import { DeliveryLogs } from './DeliveryLogs';
import type { WebhookRow as WebhookRowType } from '@/types/database/webhook';

interface WebhookRowProps {
  webhook: WebhookRowType;
  onEdit: (webhook: WebhookRowType) => void;
}

export function WebhookRow({ webhook, onEdit }: WebhookRowProps) {
  const [showLogs, setShowLogs] = useState(false);
  const toggleWebhook = useToggleWebhook();
  const deleteWebhook = useDeleteWebhook();
  const testWebhook = useTestWebhook();

  const getStatusBadge = () => {
    if (!webhook.last_delivery_status) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Never sent
        </Badge>
      );
    }

    switch (webhook.last_delivery_status) {
      case 'success':
        return (
          <Badge className="bg-success text-white">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-danger text-white">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {webhook.last_delivery_status}
          </Badge>
        );
    }
  };

  const handleToggle = async () => {
    await toggleWebhook.mutateAsync({
      id: webhook.id,
      enabled: !webhook.enabled,
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this webhook?')) {
      await deleteWebhook.mutateAsync(webhook.id);
    }
  };

  const handleTest = async () => {
    await testWebhook.mutateAsync(webhook.id);
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-border hover:bg-surface transition-colors">
        {/* Name */}
        <div className="col-span-3">
          <div className="font-medium">{webhook.name}</div>
          <div className="text-sm text-muted-foreground truncate max-w-xs">
            {webhook.url}
          </div>
        </div>

        {/* Agent */}
        <div className="col-span-2">
          <div className="text-sm text-muted-foreground">Agent ID</div>
          <div className="text-sm font-medium truncate">{webhook.agent_id.slice(0, 8)}...</div>
        </div>

        {/* Triggers */}
        <div className="col-span-2">
          <div className="flex flex-wrap gap-1">
            {webhook.triggers?.slice(0, 2).map((trigger) => (
              <Badge key={trigger} variant="outline" className="text-xs">
                {trigger.split('.')[0]}
              </Badge>
            ))}
            {webhook.triggers && webhook.triggers.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{webhook.triggers.length - 2}
              </Badge>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="col-span-2">
          {getStatusBadge()}
          {webhook.last_delivery_at && (
            <div className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(webhook.last_delivery_at), {
                addSuffix: true,
              })}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="col-span-1 text-center">
          <div className="text-sm font-medium">{webhook.total_deliveries}</div>
          <div className="text-xs text-muted-foreground">total</div>
        </div>

        {/* Enabled Toggle */}
        <div className="col-span-1 flex justify-center">
          <Switch
            checked={webhook.enabled}
            onCheckedChange={handleToggle}
            disabled={toggleWebhook.isPending}
          />
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(webhook)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTest} disabled={testWebhook.isPending}>
                <TestTube className="h-4 w-4 mr-2" />
                Test Webhook
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.open(webhook.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open URL
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowLogs(!showLogs)}
              >
                {showLogs ? 'Hide' : 'Show'} Logs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-danger focus:text-danger"
                disabled={deleteWebhook.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showLogs && <DeliveryLogs webhookId={webhook.id} />}
    </>
  );
}
