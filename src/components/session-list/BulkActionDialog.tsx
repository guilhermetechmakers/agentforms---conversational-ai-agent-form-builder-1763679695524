import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Download, CheckCircle2, AlertTriangle } from 'lucide-react';

export type BulkActionType = 'delete' | 'export' | 'mark-reviewed';

interface BulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: BulkActionType;
  sessionCount: number;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export function BulkActionDialog({
  open,
  onOpenChange,
  action,
  sessionCount,
  onConfirm,
  isProcessing = false,
}: BulkActionDialogProps) {
  const getActionConfig = () => {
    switch (action) {
      case 'delete':
        return {
          title: 'Delete Sessions',
          description: `Are you sure you want to delete ${sessionCount} session(s)? This action cannot be undone.`,
          icon: Trash2,
          confirmText: 'Delete',
          variant: 'destructive' as const,
        };
      case 'export':
        return {
          title: 'Export Sessions',
          description: `Export ${sessionCount} session(s) as JSON or CSV?`,
          icon: Download,
          confirmText: 'Export',
          variant: 'default' as const,
        };
      case 'mark-reviewed':
        return {
          title: 'Mark as Reviewed',
          description: `Mark ${sessionCount} session(s) as reviewed?`,
          icon: CheckCircle2,
          confirmText: 'Mark as Reviewed',
          variant: 'default' as const,
        };
      default:
        return {
          title: 'Confirm Action',
          description: `Perform this action on ${sessionCount} session(s)?`,
          icon: AlertTriangle,
          confirmText: 'Confirm',
          variant: 'default' as const,
        };
    }
  };

  const config = getActionConfig();
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                action === 'delete' ? 'bg-danger/10' : 'bg-primary/10'
              }`}
            >
              <Icon
                className={`h-5 w-5 ${action === 'delete' ? 'text-danger' : 'text-primary'}`}
              />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            variant={action === 'delete' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
