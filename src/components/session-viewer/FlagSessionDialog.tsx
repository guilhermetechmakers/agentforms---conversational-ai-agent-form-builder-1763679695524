import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Flag } from 'lucide-react';
import { useUpdateSession } from '@/hooks/useSessionViewer';
import type { SessionRow } from '@/types/database/session';

interface FlagSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: SessionRow;
}

export function FlagSessionDialog({
  open,
  onOpenChange,
  session,
}: FlagSessionDialogProps) {
  const [reason, setReason] = useState(session.flag_reason || '');
  const updateSession = useUpdateSession();

  useEffect(() => {
    if (open) {
      setReason(session.flag_reason || '');
    }
  }, [open, session.flag_reason]);

  const handleFlag = () => {
    updateSession.mutate(
      {
        sessionId: session.id,
        updates: {
          flagged: true,
          flag_reason: reason.trim() || null,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleUnflag = () => {
    updateSession.mutate(
      {
        sessionId: session.id,
        updates: {
          flagged: false,
          flag_reason: null,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const isLoading = updateSession.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {session.flagged ? 'Update Flag Reason' : 'Flag Session for Review'}
          </DialogTitle>
          <DialogDescription>
            {session.flagged
              ? 'Update the reason for flagging this session, or unflag it if no longer needed.'
              : 'Flag this session for quality review and provide a reason for the flag.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for flagging this session..."
              rows={4}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Provide a clear reason why this session needs review.
            </p>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {session.flagged && (
            <Button
              variant="outline"
              onClick={handleUnflag}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Unflag Session
            </Button>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleFlag} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Flag className="mr-2 h-4 w-4" />
                  {session.flagged ? 'Update Flag' : 'Flag Session'}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
