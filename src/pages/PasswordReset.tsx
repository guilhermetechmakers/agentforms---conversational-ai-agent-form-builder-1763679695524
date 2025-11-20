import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRequestPasswordReset, useResetPassword } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';

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
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [passwordValue, setPasswordValue] = useState('');

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

  // Check for Supabase password reset token in URL hash
  // Supabase uses hash fragments (#access_token=...) instead of query params
  useEffect(() => {
    const checkToken = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      // If we have a token in the hash, validate it
      if (accessToken && type === 'recovery') {
        setIsValidatingToken(true);
        try {
          // Supabase automatically handles the session when the hash is present
          // We just need to check if we have a valid session
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            setTokenValid(true);
            // Clear the hash from URL for security
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            setTokenValid(false);
          }
        } catch (error) {
          setTokenValid(false);
        } finally {
          setIsValidatingToken(false);
        }
      } else {
        // Check if there's a query param token (for custom implementations)
        const queryToken = searchParams.get('token');
        setTokenValid(queryToken ? null : false);
      }
    };

    checkToken();
  }, [searchParams]);

  // Watch password field for strength indicator
  const watchedPassword = resetForm.watch('password', '');
  useEffect(() => {
    setPasswordValue(watchedPassword);
  }, [watchedPassword]);

  // Determine if we're in reset mode
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const hasRecoveryToken = hashParams.get('type') === 'recovery';
  const queryToken = searchParams.get('token');
  const isResetMode = hasRecoveryToken || (queryToken && tokenValid !== false);

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

  // Security tips for password creation
  const securityTips = [
    'Use a unique password that you don\'t use elsewhere',
    'Avoid personal information like names or birthdays',
    'Consider using a password manager',
    'Change your password regularly',
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 group transition-transform hover:scale-105"
          >
            <MessageSquare className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-foreground">AgentForms</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-h2 mb-2">
              {isValidatingToken
                ? 'Validating reset link...'
                : isResetMode
                ? 'Reset your password'
                : 'Forgot your password?'}
            </h1>
            <p className="text-muted-foreground">
              {isValidatingToken
                ? 'Please wait while we verify your reset link'
                : isResetMode
                ? 'Enter your new password below to complete the reset process'
                : "No worries, we'll send you reset instructions via email"}
            </p>
          </div>

          <Card className="animate-fade-in-up shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isResetMode ? (
                  <>
                    <Shield className="h-5 w-5 text-primary" />
                    Set New Password
                  </>
                ) : isSubmitted ? (
                  <>
                    <Mail className="h-5 w-5 text-success" />
                    Check your email
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 text-primary" />
                    Reset Password
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {isResetMode
                  ? 'Enter your new password to complete the reset process'
                  : isSubmitted
                  ? 'We sent a password reset link to your email address. Please check your inbox and spam folder.'
                  : "Enter your email address and we'll send you a secure link to reset your password"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isValidatingToken ? (
                // Token validation state
                <div className="space-y-4 py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Validating your reset link...
                  </p>
                </div>
              ) : tokenValid === false ? (
                // Invalid token state
                <div className="space-y-4 py-8">
                  <div className="flex items-center justify-center">
                    <div className="rounded-full bg-danger/10 p-3">
                      <AlertCircle className="h-6 w-6 text-danger" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-foreground">Invalid or Expired Link</h3>
                    <p className="text-sm text-muted-foreground">
                      This password reset link is invalid or has expired. Please request a new one.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setTokenValid(null);
                      navigate('/reset-password');
                    }}
                    className="w-full"
                  >
                    Request New Reset Link
                  </Button>
                </div>
              ) : isResetMode ? (
                // Reset password form
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="reset-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="reset-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        {...resetForm.register('password')}
                        className={
                          resetForm.formState.errors.password
                            ? 'input-error pr-10'
                            : passwordValue && !resetForm.formState.errors.password
                            ? 'input-success pr-10'
                            : 'pr-10'
                        }
                        disabled={resetPassword.isPending}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {resetForm.formState.errors.password && (
                      <p className="text-sm text-danger flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {resetForm.formState.errors.password.message}
                      </p>
                    )}
                    {passwordValue && (
                      <PasswordStrengthIndicator password={passwordValue} />
                    )}
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
                        placeholder="Confirm your new password"
                        {...resetForm.register('confirmPassword')}
                        className={
                          resetForm.formState.errors.confirmPassword
                            ? 'input-error pr-10'
                            : resetForm.watch('confirmPassword') &&
                              resetForm.watch('confirmPassword') === passwordValue &&
                              !resetForm.formState.errors.confirmPassword
                            ? 'input-success pr-10'
                            : 'pr-10'
                        }
                        disabled={resetPassword.isPending}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {resetForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-danger flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {resetForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                    {resetForm.watch('confirmPassword') &&
                      resetForm.watch('confirmPassword') === passwordValue &&
                      !resetForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-success flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Passwords match
                        </p>
                      )}
                  </div>

                  {/* Security Tips */}
                  <div className="rounded-lg bg-surface/50 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold text-foreground">Security Tips</h4>
                    </div>
                    <ul className="space-y-2">
                      {securityTips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
                    {resetPassword.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Resetting password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              ) : isSubmitted ? (
                // Success message after email sent
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-center">
                    <div className="rounded-full bg-success/10 p-3">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-foreground">Check Your Email</h3>
                    <p className="text-sm text-muted-foreground">
                      If an account exists with that email address, you'll receive a password reset
                      link. Please check your inbox and spam folder.
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Didn't receive the email? The link may take a few minutes to arrive, or check
                      your spam folder.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSubmitted(false);
                        requestForm.reset();
                      }}
                      className="flex-1"
                    >
                      Send Another Email
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/login')}
                      className="flex-1"
                    >
                      Back to Login
                    </Button>
                  </div>
                </div>
              ) : (
                // Request reset form
                <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      {...requestForm.register('email')}
                      className={
                        requestForm.formState.errors.email
                          ? 'input-error'
                          : requestForm.watch('email') && !requestForm.formState.errors.email
                          ? 'input-success'
                          : ''
                      }
                      disabled={requestPasswordReset.isPending}
                      autoComplete="email"
                    />
                    {requestForm.formState.errors.email && (
                      <p className="text-sm text-danger flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {requestForm.formState.errors.email.message}
                      </p>
                    )}
                    {requestForm.watch('email') &&
                      !requestForm.formState.errors.email && (
                        <p className="text-sm text-success flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Valid email address
                        </p>
                      )}
                  </div>

                  <Button type="submit" className="w-full" disabled={requestPasswordReset.isPending}>
                    {requestPasswordReset.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="text-primary-variant hover:underline font-medium transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border bg-card py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>Need help?</span>
              <Link
                to="/help"
                className="text-primary-variant hover:underline font-medium ml-1"
              >
                Contact Support
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-border">•</span>
              <Link
                to="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
