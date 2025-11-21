import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { History, CheckCircle2, Lock } from 'lucide-react';
import { useAgentSchemas } from '@/hooks/useSchemaBuilder';
import { format } from 'date-fns';

interface VersionManagementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  currentSchemaId: string | null;
}

export function VersionManagementSheet({
  open,
  onOpenChange,
  agentId,
  currentSchemaId,
}: VersionManagementSheetProps) {
  const { data: schemas = [], isLoading } = useAgentSchemas(agentId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Schema Versions
          </SheetTitle>
          <SheetDescription>
            View and manage all versions of this schema. Published versions are locked and cannot be modified.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading versions...</p>
          ) : schemas.length === 0 ? (
            <p className="text-sm text-muted-foreground">No versions found.</p>
          ) : (
            schemas.map((schema) => (
              <div
                key={schema.id}
                className={`p-4 border rounded-lg ${
                  schema.id === currentSchemaId ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{schema.name}</h3>
                      <Badge variant="secondary">v{schema.version}</Badge>
                      {schema.is_published && (
                        <Badge variant="default" className="bg-success">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      )}
                      {schema.is_locked && (
                        <Badge variant="outline">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                    {schema.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {schema.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Created: {format(new Date(schema.created_at), 'MMM d, yyyy HH:mm')}
                      </span>
                      {schema.published_at && (
                        <span>
                          Published: {format(new Date(schema.published_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      )}
                    </div>
                  </div>
                  {schema.id === currentSchemaId && (
                    <Badge variant="outline" className="ml-4">
                      Current
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
