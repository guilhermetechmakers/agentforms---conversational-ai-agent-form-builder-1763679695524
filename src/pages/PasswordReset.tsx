import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRequestPasswordReset, useResetPassword } from '@/hooks/useAuth';

// Request reset schema
const requestResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Reset password schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RequestResetForm = z.infer<typeof requestResetSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function PasswordReset() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const requestPasswordReset = useRequestPasswordReset();
  const resetPassword = useResetPassword();

  // Request reset form
  const requestForm = useForm<RequestResetForm>({
    resolver: zodResolver(requestResetSchema),
  });

  // Reset password form
  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // If token exists, show reset form; otherwise show request form
  const isResetMode = !!token;

  const onRequestSubmit = async (data: RequestResetForm) => {
    try {
      await requestPasswordReset.mutateAsync(data);
      setIsSubmitted(true);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const onResetSubmit = async (data: ResetPasswordForm) => {
    try {
      await resetPassword.mutateAsync(data.password);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-down">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <MessageSquare className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <span className="text-2xl font-bold text-foreground">AgentForms</span>
          </Link>
          <h1 className="text-h2 mb-2">
            {isResetMode ? 'Reset your password' : 'Forgot your password?'}
          </h1>
          <p className="text-muted">
            {isResetMode
              ? 'Enter your new password below'
              : "No worries, we'll send you reset instructions"}
          </p>
        </div>

        <Card className="animate-fade-in-up shadow-card">
          <CardHeader>
            <CardTitle>
              {isResetMode ? 'Set New Password' : isSubmitted ? 'Check your email' : 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {isResetMode
                ? 'Enter your new password to complete the reset process'
                : isSubmitted
                ? 'We sent a password reset link to your email address'
                : "Enter your email address and we'll send you a link to reset your password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isResetMode ? (
              // Reset password form
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...resetForm.register('password')}
                      className={
                        resetForm.formState.errors.password ? 'input-error pr-10' : 'pr-10'
                      }
                      disabled={resetPassword.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {resetForm.formState.errors.password && (
                    <p className="text-sm text-danger">
                      {resetForm.formState.errors.password.message}
                    </p>
                  )}
                  <p className="text-xs text-muted">
                    Must be at least 6 characters with uppercase, lowercase, and number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-confirm-password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...resetForm.register('confirmPassword')}
                      className={
                        resetForm.formState.errors.confirmPassword ? 'input-error pr-10' : 'pr-10'
                      }
                      disabled={resetPassword.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-danger">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
                  {resetPassword.isPending ? 'Resetting password...' : 'Reset Password'}
                </Button>
              </form>
            ) : isSubmitted ? (
              // Success message
              <div className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-sm text-muted mb-4">
                    If an account exists with that email, you'll receive a password reset link.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitted(false);
                      requestForm.reset();
                    }}
                  >
                    Send another email
                  </Button>
                </div>
              </div>
            ) : (
              // Request reset form
              <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    {...requestForm.register('email')}
                    className={requestForm.formState.errors.email ? 'input-error' : ''}
                    disabled={requestPasswordReset.isPending}
                  />
                  {requestForm.formState.errors.email && (
                    <p className="text-sm text-danger">
                      {requestForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={requestPasswordReset.isPending}>
                  {requestPasswordReset.isPending ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-muted">
              Remember your password?{' '}
              <Link to="/login" className="text-primary-variant hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
