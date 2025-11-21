import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as analyticsApi from '@/api/analytics';

interface ExportAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function ExportAnalyticsDialog({
  open,
  onOpenChange,
  agentId,
  dateFrom,
  dateTo,
}: ExportAnalyticsDialogProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filters = {
        agentId,
        dateFrom,
        dateTo,
      };

      let data: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        data = await analyticsApi.exportAnalyticsJSON(filters);
        filename = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        data = await analyticsApi.exportAnalyticsCSV(filters);
        filename = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      // Create blob and download
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Analytics data exported as ${format.toUpperCase()}`);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Failed to export analytics: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Analytics Data</DialogTitle>
          <DialogDescription>
            Choose a format to export your analytics data. The export will include all available metrics and charts data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'json' | 'csv')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="font-normal cursor-pointer">
                  JSON (Recommended for data analysis)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="font-normal cursor-pointer">
                  CSV (Recommended for spreadsheets)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
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
