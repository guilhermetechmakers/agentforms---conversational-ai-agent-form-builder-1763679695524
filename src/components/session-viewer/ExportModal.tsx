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
import { Download, Loader2 } from 'lucide-react';
import { useExportSessionJSON, useExportSessionCSV } from '@/hooks/useSessionViewer';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
}

export function ExportModal({ open, onOpenChange, sessionId }: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const exportJSON = useExportSessionJSON();
  const exportCSV = useExportSessionCSV();

  const handleExport = () => {
    if (format === 'json') {
      exportJSON.mutate(sessionId, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    } else {
      exportCSV.mutate(sessionId, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  const isLoading = exportJSON.isPending || exportCSV.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Session Data</DialogTitle>
          <DialogDescription>
            Choose a format to export the session data, including messages, extracted fields, and metadata.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={format} onValueChange={(value) => setFormat(value as 'json' | 'csv')}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {format === 'json'
                ? 'Exports complete session data including messages, extracted fields, and notes in JSON format.'
                : 'Exports session data in CSV format, suitable for spreadsheet applications.'}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
