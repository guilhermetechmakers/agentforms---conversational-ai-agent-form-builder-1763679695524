import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateUserEmail } from '@/hooks/useAuth';

const changeEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ChangeEmailForm = z.infer<typeof changeEmailSchema>;

interface ChangeEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail?: string | null;
}

export function ChangeEmailModal({
  open,
  onOpenChange,
  currentEmail,
}: ChangeEmailModalProps) {
  const updateEmail = useUpdateUserEmail();

  const form = useForm<ChangeEmailForm>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: currentEmail || '',
    },
  });

  const onSubmit = async (data: ChangeEmailForm) => {
    if (data.email === currentEmail) {
      form.setError('email', {
        message: 'This is already your current email address.',
      });
      return;
    }

    try {
      await updateEmail.mutateAsync(data.email);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Change Email Address</DialogTitle>
          <DialogDescription>
            Enter your new email address. A verification email will be sent to
            the new address.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">New Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                {...form.register('email')}
                disabled={updateEmail.isPending}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-danger">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
              disabled={updateEmail.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateEmail.isPending}>
              {updateEmail.isPending ? 'Updating...' : 'Update Email'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
