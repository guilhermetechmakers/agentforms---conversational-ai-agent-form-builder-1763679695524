import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    status?: "draft" | "published" | "archived";
    tags?: string[];
  };
  onFiltersChange: (filters: {
    status?: "draft" | "published" | "archived";
    tags?: string[];
  }) => void;
  availableTags: string[];
}

export function FilterSidebar({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  availableTags,
}: FilterSidebarProps) {
  const [localStatus, setLocalStatus] = useState<"draft" | "published" | "archived" | undefined>(filters.status);
  const [localTags, setLocalTags] = useState<string[]>(filters.tags || []);

  const handleApply = () => {
    onFiltersChange({
      status: localStatus,
      tags: localTags.length > 0 ? localTags : undefined,
    });
  };

  const handleClear = () => {
    setLocalStatus(undefined);
    setLocalTags([]);
    onFiltersChange({});
  };

  const toggleTag = (tag: string) => {
    setLocalTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 right-0 z-50 w-80 bg-card border-l border-border transform transition-transform duration-200 ease-in-out overflow-y-auto",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <Card className="border-0 shadow-none rounded-none h-full">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted" />
                <CardTitle className="text-lg">Filters</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Status Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Status</h3>
              <div className="space-y-2">
                {(["draft", "published", "archived"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setLocalStatus(localStatus === status ? undefined : status)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      localStatus === status
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-surface text-muted"
                    )}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={localTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClear}
              >
                Clear
              </Button>
              <Button
                className="flex-1"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
