import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Send } from 'lucide-react';
import { useResendWebhook } from '@/hooks/useSessionViewer';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface ResendWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  agentId: string;
}

async function getWebhooksForAgent(agentId: string) {
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('agent_id', agentId)
    .eq('enabled', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch webhooks: ${error.message}`);
  }

  return data || [];
}

export function ResendWebhookDialog({
  open,
  onOpenChange,
  sessionId,
  agentId,
}: ResendWebhookDialogProps) {
  const [selectedWebhookId, setSelectedWebhookId] = useState<string>('');
  const resendWebhook = useResendWebhook();

  const { data: webhooks, isLoading: webhooksLoading } = useQuery({
    queryKey: ['webhooks', agentId],
    queryFn: () => getWebhooksForAgent(agentId),
    enabled: open && !!agentId,
  });

  const handleResend = () => {
    if (!selectedWebhookId) return;

    resendWebhook.mutate(
      { sessionId, webhookId: selectedWebhookId },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedWebhookId('');
        },
      }
    );
  };

  const isLoading = resendWebhook.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resend Webhook</DialogTitle>
          <DialogDescription>
            Select a webhook to resend the session data. This will create a new delivery attempt.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Webhook</label>
            {webhooksLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : webhooks && webhooks.length > 0 ? (
              <Select value={selectedWebhookId} onValueChange={setSelectedWebhookId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a webhook" />
                </SelectTrigger>
                <SelectContent>
                  {webhooks.map((webhook: any) => (
                    <SelectItem key={webhook.id} value={webhook.id}>
                      {webhook.name} ({webhook.url})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                No webhooks configured for this agent.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleResend}
            disabled={isLoading || !selectedWebhookId || !webhooks || webhooks.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Resend
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
