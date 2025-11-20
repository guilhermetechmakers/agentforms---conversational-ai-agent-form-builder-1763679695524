import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  {
    label: 'At least 6 characters',
    test: (pwd) => pwd.length >= 6,
  },
  {
    label: 'One uppercase letter',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: 'One lowercase letter',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: 'One number',
    test: (pwd) => /[0-9]/.test(pwd),
  },
];

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const metRequirements = requirements.filter((req) => req.test(password));
  const strength = metRequirements.length;
  const strengthPercentage = (strength / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercentage < 50) return 'bg-danger';
    if (strengthPercentage < 75) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300',
            getStrengthColor()
          )}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>
      <div className="space-y-1.5">
        {requirements.map((req, index) => {
          const isMet = req.test(password);
          return (
            <div
              key={index}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors',
                isMet ? 'text-success' : 'text-muted-foreground'
              )}
            >
              {isMet ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              <span>{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
