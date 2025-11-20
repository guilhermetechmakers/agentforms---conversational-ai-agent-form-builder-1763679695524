import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangeEmailModal } from '@/components/auth/ChangeEmailModal';
import { useResendVerificationEmail, useEmailVerificationStatus, useUser } from '@/hooks/useAuth';

// Rate limiting: max 3 resends per 5 minutes
const MAX_RESENDS = 3;
const RESEND_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export default function EmailVerification() {
  const navigate = useNavigate();
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [resendAttempts, setResendAttempts] = useState<number[]>([]);
  const [canResend, setCanResend] = useState(true);
  const [timeUntilResend, setTimeUntilResend] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: user } = useUser();
  const { data: verificationStatus, isLoading: isLoadingStatus } = useEmailVerificationStatus(
    !!user && !user.email_confirmed_at
  );
  const resendEmail = useResendVerificationEmail();

  const isVerified = verificationStatus?.verified ?? false;
  const userEmail = verificationStatus?.email || user?.email;

  // Rate limiting logic
  useEffect(() => {
    const now = Date.now();
    const recentAttempts = resendAttempts.filter(
      (timestamp) => now - timestamp < RESEND_WINDOW_MS
    );
    setResendAttempts(recentAttempts);

    if (recentAttempts.length >= MAX_RESENDS) {
      setCanResend(false);
      const oldestAttempt = Math.min(...recentAttempts);
      const timeRemaining = RESEND_WINDOW_MS - (now - oldestAttempt);

      if (timeRemaining > 0) {
        setTimeUntilResend(timeRemaining);

        // Update countdown every second
        intervalRef.current = setInterval(() => {
          const currentTime = Date.now();
          const remaining = RESEND_WINDOW_MS - (currentTime - oldestAttempt);

          if (remaining <= 0) {
            setCanResend(true);
            setTimeUntilResend(null);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          } else {
            setTimeUntilResend(remaining);
          }
        }, 1000);
      }
    } else {
      setCanResend(true);
      setTimeUntilResend(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [resendAttempts]);

  // Redirect if already verified
  useEffect(() => {
    if (isVerified && user) {
      // Small delay to show success state
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVerified, user, navigate]);

  const handleResend = async () => {
    if (!canResend || resendEmail.isPending) return;

    try {
      await resendEmail.mutateAsync(userEmail || undefined);
      setResendAttempts((prev) => [...prev, Date.now()]);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show loading state while checking user
  if (!user && isLoadingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="animate-fade-in-up shadow-card">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {isVerified ? (
                <CheckCircle2 className="h-8 w-8 text-success animate-scale-in" />
              ) : (
                <Mail className="h-8 w-8 text-primary" />
              )}
            </div>
            <CardTitle className="text-h2">
              {isVerified ? 'Email Verified!' : 'Verify Your Email'}
            </CardTitle>
            <CardDescription className="text-base">
              {isVerified ? (
                <span className="text-success font-medium">
                  Your email has been successfully verified. Redirecting you to the dashboard...
                </span>
              ) : (
                <>
                  We've sent a verification email to{' '}
                  <span className="font-medium text-foreground">{userEmail}</span>
                  <br />
                  <br />
                  Please check your inbox and click the verification link to continue.
                </>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!isVerified && (
              <>
                {/* Resend Button */}
                <div className="space-y-2">
                  <Button
                    onClick={handleResend}
                    disabled={!canResend || resendEmail.isPending}
                    className="w-full"
                    variant="default"
                  >
                    {resendEmail.isPending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>

                  {!canResend && timeUntilResend !== null && (
                    <p className="text-sm text-muted-foreground text-center">
                      You've reached the resend limit. Please wait{' '}
                      <span className="font-medium text-foreground">
                        {formatTimeRemaining(timeUntilResend)}
                      </span>{' '}
                      before requesting another email.
                    </p>
                  )}

                  {canResend && resendAttempts.length > 0 && resendAttempts.length < MAX_RESENDS && (
                    <p className="text-sm text-muted-foreground text-center">
                      {MAX_RESENDS - resendAttempts.length} resend
                      {MAX_RESENDS - resendAttempts.length === 1 ? '' : 's'} remaining
                    </p>
                  )}
                </div>

                {/* Change Email Link */}
                <div className="text-center">
                  <button
                    onClick={() => setShowChangeEmailModal(true)}
                    className="text-sm text-primary hover:text-primary-variant underline-offset-4 hover:underline transition-colors"
                  >
                    Change email address
                  </button>
                </div>
              </>
            )}

            {/* Continue Button */}
            {isVerified && (
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full animate-fade-in"
                size="lg"
              >
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {/* Help Text */}
            {!isVerified && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setShowChangeEmailModal(true)}
                    className="text-primary hover:text-primary-variant underline-offset-4 hover:underline font-medium"
                  >
                    try a different email address
                  </button>
                  .
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Email Modal */}
        <ChangeEmailModal
          open={showChangeEmailModal}
          onOpenChange={setShowChangeEmailModal}
          currentEmail={userEmail}
        />
      </div>
    </div>
  );
}
