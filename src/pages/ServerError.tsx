import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Home, RefreshCw, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useLog500Error, useCreateSupportTicketFromError } from '@/hooks/useErrors';
import { useUser } from '@/hooks/useAuth';

// Support ticket form schema
const supportTicketSchema = z.object({
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

type SupportTicketForm = z.infer<typeof supportTicketSchema>;

export default function ServerError() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: user } = useUser();
  const log500Error = useLog500Error();
  const createSupportTicket = useCreateSupportTicketFromError();
  const [errorLogId, setErrorLogId] = useState<string | null>(null);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const form = useForm<SupportTicketForm>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      email: user?.email || '',
      subject: 'Server Error Report',
      description: `I encountered a server error while trying to access: ${location.pathname}\n\nPlease investigate this issue.`,
    },
  });

  // Log the 500 error when component mounts
  useEffect(() => {
    const errorMessage = location.state?.error?.message || 'Internal server error';
    const stackTrace = location.state?.error?.stack || undefined;

    log500Error.mutate(
      {
        url: location.pathname + location.search,
        errorMessage,
        stackTrace,
        userAgent: navigator.userAgent,
      },
      {
        onSuccess: (errorLog) => {
          setErrorLogId(errorLog.id);
        },
      }
    );
  }, [location.pathname, location.search]);

  const handleRetry = () => {
    // Try to reload the page or navigate back
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      window.location.href = '/';
    }
  };

  const onSubmit = async (data: SupportTicketForm) => {
    if (!errorLogId) {
      form.setError('root', {
        message: 'Error log not created. Please try again.',
      });
      return;
    }

    try {
      const result = await createSupportTicket.mutateAsync({
        errorLogId,
        ticketData: {
          email: data.email,
          subject: data.subject,
          description: data.description,
          user_id: user?.id || null,
          priority: 'high',
          status: 'open',
        },
      });

      setTicketCreated(true);
      setTicketId(result.ticket.id);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (ticketCreated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="animate-fade-in-up shadow-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-h2">Support Ticket Created</CardTitle>
              <CardDescription className="text-base">
                Thank you for reporting this issue!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-surface rounded-lg p-4">
                <p className="text-sm text-muted mb-2">Support Ticket ID:</p>
                <p className="font-mono text-sm font-semibold text-foreground">{ticketId}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  We've received your support ticket and will investigate the issue. You'll receive
                  an email confirmation at <strong>{form.getValues('email')}</strong> shortly.
                </p>
                <p className="text-sm text-muted">
                  Our team typically responds within 24 hours. If this is urgent, please contact us
                  directly through our{' '}
                  <Link to="/help" className="text-primary-variant hover:underline">
                    help center
                  </Link>
                  .
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleRetry} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/dashboard">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Error Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-danger/10 flex items-center justify-center animate-bounce-in">
            <AlertCircle className="h-10 w-10 text-danger" />
          </div>
          <h1 className="text-h1 mb-3 animate-fade-in-up animation-delay-2000">
            Server Error
          </h1>
          <p className="text-muted text-lg animate-fade-in-up animation-delay-4000">
            We're sorry, but something went wrong on our end. This isn't your fault.
          </p>
        </div>

        {/* Support Ticket Form Card */}
        <Card className="mb-6 animate-fade-in-up animation-delay-4000 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Report This Issue
            </CardTitle>
            <CardDescription>
              Help us fix this by reporting the error. We'll investigate and get back to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          disabled={createSupportTicket.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        We'll send updates about this issue to this email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief description of the issue"
                          disabled={createSupportTicket.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe what you were trying to do when this error occurred..."
                          className="min-h-[120px]"
                          disabled={createSupportTicket.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include any steps you took before encountering this error
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <div className="text-sm text-danger">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    onClick={handleRetry}
                    variant="outline"
                    className="flex-1"
                    disabled={createSupportTicket.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createSupportTicket.isPending || !errorLogId}
                  >
                    {createSupportTicket.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-4000">
          <Button onClick={handleRetry} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Action
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to="/help">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Helpful Message */}
        <div className="mt-8 text-center text-sm text-muted animate-fade-in-up animation-delay-4000">
          <p>
            This error has been logged automatically. If the problem persists, please{' '}
            <Link to="/help" className="text-primary-variant hover:underline font-medium">
              contact our support team
            </Link>
            {' '}directly.
          </p>
        </div>
      </div>
    </div>
  );
}
