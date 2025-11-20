import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  completed: number;
  total: number;
  className?: string;
}

export function ProgressIndicator({ completed, total, className }: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const remaining = total - completed;

  return (
    <div className={cn('px-4 py-3 border-b border-border bg-surface/50', className)}>
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-small font-medium text-foreground">
          Progress: {completed} of {total} fields completed
        </span>
        <span className="text-small text-muted-foreground">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      {remaining > 0 && (
        <p className="text-small text-muted-foreground mt-2">
          {remaining} {remaining === 1 ? 'field' : 'fields'} remaining
        </p>
      )}
    </div>
  );
}
