import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickReplyChipsProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
  primaryColor?: string;
}

export function QuickReplyChips({
  options,
  onSelect,
  disabled = false,
  primaryColor = '#4F46E5',
}: QuickReplyChipsProps) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelect(option)}
          disabled={disabled}
          className={cn(
            'rounded-full text-sm font-normal transition-all duration-200',
            'hover:scale-105 active:scale-95'
          )}
          style={{
            borderColor: `${primaryColor}40`,
            color: primaryColor,
          }}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
