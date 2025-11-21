import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useResolveDraftConflict } from '@/hooks/useSchemaBuilder';
import type { SchemaDraftRow } from '@/types/database/schema-draft';
import type { AgentSchemaRow } from '@/types/database/agent-schema';
import type { AgentSchema } from '@/types/agent';

interface ConflictResolutionDialogProps {
  draft: SchemaDraftRow;
  currentSchema: AgentSchemaRow | null;
  onResolve: (resolvedContent: AgentSchema) => void;
}

export function ConflictResolutionDialog({
  draft,
  currentSchema,
  onResolve,
}: ConflictResolutionDialogProps) {
  const [resolution, setResolution] = useState<'draft' | 'current' | 'merge'>('draft');
  const resolveConflict = useResolveDraftConflict();

  const handleResolve = () => {
    let resolvedContent: AgentSchema;

    switch (resolution) {
      case 'draft':
        resolvedContent = draft.content as AgentSchema;
        break;
      case 'current':
        // Get current schema fields and convert to AgentSchema
        resolvedContent = { fields: [] }; // This would need to fetch current fields
        break;
      case 'merge':
        // Merge logic would go here
        resolvedContent = draft.content as AgentSchema;
        break;
      default:
        resolvedContent = draft.content as AgentSchema;
    }

    resolveConflict.mutate(
      {
        draftId: draft.id,
        resolvedContent,
      },
      {
        onSuccess: () => {
          onResolve(resolvedContent);
        },
      }
    );
  };

  return (
    <Dialog open={draft.conflict_detected && !draft.conflict_resolved}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Schema Conflict Detected
          </DialogTitle>
          <DialogDescription>
            Another user has modified this schema since you started editing. Please choose how to resolve the conflict.
          </DialogDescription>
        </DialogHeader>

        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The schema was modified at {currentSchema?.updated_at 
              ? new Date(currentSchema.updated_at).toLocaleString()
              : 'unknown time'}. Your draft was last saved at{' '}
            {new Date(draft.updated_at).toLocaleString()}.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="resolution"
                value="draft"
                checked={resolution === 'draft'}
                onChange={(e) => setResolution(e.target.value as 'draft')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">Keep My Changes (Draft)</p>
                <p className="text-sm text-muted-foreground">
                  Use your draft version and overwrite the current schema.
                </p>
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="resolution"
                value="current"
                checked={resolution === 'current'}
                onChange={(e) => setResolution(e.target.value as 'current')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">Use Current Schema</p>
                <p className="text-sm text-muted-foreground">
                  Discard your draft and use the current published schema.
                </p>
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="resolution"
                value="merge"
                checked={resolution === 'merge'}
                onChange={(e) => setResolution(e.target.value as 'merge')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium">Merge Changes</p>
                <p className="text-sm text-muted-foreground">
                  Attempt to merge both versions (may require manual review).
                </p>
              </div>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              // Cancel - keep conflict unresolved
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleResolve} disabled={resolveConflict.isPending}>
            {resolveConflict.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Resolving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Resolve Conflict
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
