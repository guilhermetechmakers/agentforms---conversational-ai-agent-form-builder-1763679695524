import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Calendar } from 'lucide-react';
import type { GetSessionsFilters } from '@/api/sessions';

interface SessionFiltersProps {
  filters: GetSessionsFilters;
  onFiltersChange: (filters: GetSessionsFilters) => void;
  availableTags?: string[];
}

export function SessionFilters({
  filters,
  onFiltersChange,
  availableTags = [],
}: SessionFiltersProps) {
  const [localFilters, setLocalFilters] = useState<GetSessionsFilters>(filters);

  const handleFilterChange = (key: keyof GetSessionsFilters, value: any) => {
    const updated = { ...localFilters, [key]: value || undefined };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleClearFilters = () => {
    const cleared: GetSessionsFilters = {
      page: 1,
      pageSize: 20,
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const hasActiveFilters =
    localFilters.visitorId ||
    localFilters.status ||
    (localFilters.tags && localFilters.tags.length > 0) ||
    localFilters.dateFrom ||
    localFilters.dateTo ||
    localFilters.flagged !== undefined ||
    localFilters.completionRateMin !== undefined ||
    localFilters.search;

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted" />
          <h3 className="text-sm font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted">Search</label>
          <Input
            placeholder="Visitor ID or email..."
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="h-9"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted">Status</label>
          <Select
            value={localFilters.status || ''}
            onValueChange={(value) =>
              handleFilterChange('status', value || undefined)
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted">Date From</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              type="date"
              value={localFilters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="h-9 pl-10"
            />
          </div>
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted">Date To</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              type="date"
              value={localFilters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="h-9 pl-10"
            />
          </div>
        </div>

        {/* Completion Rate Min */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted">
            Min Completion Rate (%)
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="0"
            value={localFilters.completionRateMin || ''}
            onChange={(e) =>
              handleFilterChange(
                'completionRateMin',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="h-9"
          />
        </div>

        {/* Flagged */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted">Flagged</label>
          <Select
            value={
              localFilters.flagged === undefined
                ? ''
                : localFilters.flagged
                ? 'true'
                : 'false'
            }
            onValueChange={(value) =>
              handleFilterChange(
                'flagged',
                value === '' ? undefined : value === 'true'
              )
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="true">Flagged</SelectItem>
              <SelectItem value="false">Not Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isSelected = localFilters.tags?.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => {
                    const currentTags = localFilters.tags || [];
                    const updatedTags = isSelected
                      ? currentTags.filter((t) => t !== tag)
                      : [...currentTags, tag];
                    handleFilterChange('tags', updatedTags.length > 0 ? updatedTags : undefined);
                  }}
                >
                  {tag}
                  {isSelected && <X className="h-3 w-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <span className="text-xs text-muted">Active filters:</span>
          {localFilters.status && (
            <Badge variant="secondary" className="text-xs">
              Status: {localFilters.status}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange('status', undefined)}
              />
            </Badge>
          )}
          {localFilters.tags && localFilters.tags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Tags: {localFilters.tags.length}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange('tags', undefined)}
              />
            </Badge>
          )}
          {localFilters.flagged !== undefined && (
            <Badge variant="secondary" className="text-xs">
              Flagged: {localFilters.flagged ? 'Yes' : 'No'}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange('flagged', undefined)}
              />
            </Badge>
          )}
          {localFilters.completionRateMin !== undefined && (
            <Badge variant="secondary" className="text-xs">
              Min Completion: {localFilters.completionRateMin}%
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange('completionRateMin', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
