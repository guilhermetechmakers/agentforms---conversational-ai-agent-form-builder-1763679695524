import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface PrivacyNoticeProps {
  agentName: string;
}

export function PrivacyNotice({ agentName }: PrivacyNoticeProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-small text-muted-foreground h-auto p-1">
          <Shield className="h-3 w-3 mr-1" />
          Privacy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Privacy Notice</DialogTitle>
          <DialogDescription>
            How we handle your data when using {agentName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            Your conversation with {agentName} is stored securely and used only to provide you with
            the requested service. We respect your privacy and comply with data protection
            regulations.
          </p>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Data Collection</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Messages you send and receive</li>
              <li>Information you provide during the conversation</li>
              <li>Session metadata (timestamp, duration)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Data Usage</h4>
            <p>
              Your data is used to process your requests and improve the service. It may be shared
              with the agent owner for their business purposes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Your Rights</h4>
            <p>
              You have the right to access, correct, or delete your data. Contact the agent owner
              or visit our{' '}
              <a href="/privacy" className="text-primary underline">
                Privacy Policy
              </a>{' '}
              for more information.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
