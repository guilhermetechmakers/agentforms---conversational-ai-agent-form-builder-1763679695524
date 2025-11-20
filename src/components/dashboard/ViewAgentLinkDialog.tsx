import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ViewAgentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentName: string;
  publicUrl: string;
}

export function ViewAgentLinkDialog({
  open,
  onOpenChange,
  agentName,
  publicUrl,
}: ViewAgentLinkDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleOpenLink = () => {
    window.open(publicUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agent Link</DialogTitle>
          <DialogDescription>
            Share this link to allow visitors to interact with <strong>{agentName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex gap-2">
            <Input
              value={publicUrl}
              readOnly
              className="flex-1 font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title="Copy link"
            >
              <Copy className={copied ? "h-4 w-4 text-success" : "h-4 w-4"} />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleOpenLink}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
