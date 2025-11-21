import { AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface ErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  dismissLabel?: string;
  showHelpLink?: boolean;
  helpUrl?: string;
}

export function ErrorModal({
  open,
  onOpenChange,
  title = 'Something went wrong',
  message,
  details,
  onRetry,
  onDismiss,
  retryLabel = 'Retry',
  dismissLabel = 'Dismiss',
  showHelpLink = true,
  helpUrl = '/help',
}: ErrorModalProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    onOpenChange(false);
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10">
              <AlertCircle className="h-5 w-5 text-danger" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-left">{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-left pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        {details && (
          <div className="rounded-lg bg-surface border border-border p-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Details</p>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {details}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {showHelpLink && (
            <Button
              variant="outline"
              onClick={() => {
                window.open(helpUrl, '_blank');
              }}
              className="w-full sm:w-auto"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Get Help
            </Button>
          )}
          {onRetry && (
            <Button
              onClick={handleRetry}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryLabel}
            </Button>
          )}
          <Button
            variant={onRetry ? 'outline' : 'default'}
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            {dismissLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
