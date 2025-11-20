import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download } from 'lucide-react';

interface EndSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: () => void;
  onGetTranscript?: () => void;
  canGetTranscript?: boolean;
  isCompleted?: boolean;
}

export function EndSessionDialog({
  open,
  onOpenChange,
  onFinish,
  onGetTranscript,
  canGetTranscript = false,
  isCompleted = false,
}: EndSessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success" />
                Session Completed
              </>
            ) : (
              'End Session'
            )}
          </DialogTitle>
          <DialogDescription>
            {isCompleted
              ? 'All required fields have been collected. You can now finish the session.'
              : 'Are you sure you want to end this session? You can always come back later.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {canGetTranscript && onGetTranscript && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                onGetTranscript();
                onOpenChange(false);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Transcript
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onFinish}>Finish Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
