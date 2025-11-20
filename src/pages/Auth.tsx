import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, Mail, Lock, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useSignUp, useSignIn, useSignInWithOAuth } from '@/hooks/useAuth';
import { PasswordResetDialog } from '@/components/auth/PasswordResetDialog';

// Login form schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Signup form schema
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  company: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Auth() {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const initialTab = currentPath === '/signup' ? 'signup' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Update URL when tab changes
  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    navigate(tab === 'signup' ? '/signup' : '/login', { replace: true });
  };

  const signUp = useSignUp();
  const signIn = useSignIn();
  const signInWithOAuth = useSignInWithOAuth();

  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Signup form
  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      acceptTerms: false,
    },
  });

  const onLoginSubmit = async (data: LoginForm) => {
    try {
      await signIn.mutateAsync(data);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const onSignupSubmit = async (data: SignupForm) => {
    try {
      await signUp.mutateAsync(data);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'microsoft') => {
    try {
      // Map 'microsoft' to 'azure' for Supabase
      const supabaseProvider: 'google' | 'azure' = provider === 'microsoft' ? 'azure' : 'google';
      await signInWithOAuth.mutateAsync(supabaseProvider);
      // OAuth redirect will happen automatically
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <MessageSquare className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <span className="text-2xl font-bold text-foreground">AgentForms</span>
          </Link>
          <h1 className="text-h2 mb-2">
            {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-muted">
            {activeTab === 'login'
              ? 'Sign in to your account to continue'
              : 'Start building conversational forms today'}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="animate-fade-in-up shadow-card">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as 'login' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="transition-all">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="transition-all">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="mt-0">
                <CardTitle className="mb-2">Sign In</CardTitle>
                <CardDescription>
                  Enter your email and password to access your account
                </CardDescription>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="mt-0">
                <CardTitle className="mb-2">Sign Up</CardTitle>
                <CardDescription>
                  Enter your information to create a new account
                </CardDescription>
              </TabsContent>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as 'login' | 'signup')}>
              {/* Login Form */}
              <TabsContent value="login" className="space-y-4 mt-0">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      {...loginForm.register('email')}
                      className={loginForm.formState.errors.email ? 'input-error' : ''}
                      disabled={signIn.isPending}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-danger">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowPasswordReset(true)}
                        className="text-sm text-primary-variant hover:underline transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      {...loginForm.register('password')}
                      className={loginForm.formState.errors.password ? 'input-error' : ''}
                      disabled={signIn.isPending}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-danger">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={signIn.isPending}>
                    {signIn.isPending ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup" className="space-y-4 mt-0">
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      {...signupForm.register('name')}
                      className={signupForm.formState.errors.name ? 'input-error' : ''}
                      disabled={signUp.isPending}
                    />
                    {signupForm.formState.errors.name && (
                      <p className="text-sm text-danger">
                        {signupForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      {...signupForm.register('email')}
                      className={signupForm.formState.errors.email ? 'input-error' : ''}
                      disabled={signUp.isPending}
                    />
                    {signupForm.formState.errors.email && (
                      <p className="text-sm text-danger">
                        {signupForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      {...signupForm.register('password')}
                      className={signupForm.formState.errors.password ? 'input-error' : ''}
                      disabled={signUp.isPending}
                    />
                    {signupForm.formState.errors.password && (
                      <p className="text-sm text-danger">
                        {signupForm.formState.errors.password.message}
                      </p>
                    )}
                    <p className="text-xs text-muted">
                      Must be at least 6 characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-company" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company (Optional)
                    </Label>
                    <Input
                      id="signup-company"
                      type="text"
                      placeholder="Acme Inc."
                      {...signupForm.register('company')}
                      disabled={signUp.isPending}
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={signupForm.watch('acceptTerms')}
                      onCheckedChange={(checked) =>
                        signupForm.setValue('acceptTerms', checked === true)
                      }
                      disabled={signUp.isPending}
                    />
                    <label
                      htmlFor="acceptTerms"
                      className="text-sm text-muted leading-tight cursor-pointer"
                    >
                      I agree to the{' '}
                      <Link
                        to="/terms"
                        className="text-primary-variant hover:underline font-medium"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        to="/privacy"
                        className="text-primary-variant hover:underline font-medium"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {signupForm.formState.errors.acceptTerms && (
                    <p className="text-sm text-danger">
                      {signupForm.formState.errors.acceptTerms.message}
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={signUp.isPending}>
                    {signUp.isPending ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* OAuth Section */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                type="button"
                className="w-full transition-all hover:scale-[1.02]"
                onClick={() => handleOAuthSignIn('google')}
                disabled={signInWithOAuth.isPending}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full transition-all hover:scale-[1.02]"
                onClick={() => handleOAuthSignIn('microsoft')}
                disabled={signInWithOAuth.isPending}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23" fill="currentColor">
                  <path d="M0 0h11.377v11.372H0z" fill="#f25022" />
                  <path d="M12.623 0H24v11.372H12.623z" fill="#00a4ef" />
                  <path d="M0 12.628h11.377V24H0z" fill="#7fba00" />
                  <path d="M12.623 12.628H24V24H12.623z" fill="#ffb900" />
                </svg>
                Microsoft
              </Button>
            </div>

            {/* Switch between login/signup */}
            <p className="mt-6 text-center text-sm text-muted">
              {activeTab === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('signup')}
                    className="text-primary-variant hover:underline font-medium transition-colors"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="text-primary-variant hover:underline font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-muted">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="hover:underline text-primary-variant">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="hover:underline text-primary-variant">
              Privacy Policy
            </Link>
          </p>
          <p className="text-xs text-muted">
            Need enterprise SSO?{' '}
            <Link to="/help" className="hover:underline text-primary-variant">
              Contact us
            </Link>
          </p>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <PasswordResetDialog open={showPasswordReset} onOpenChange={setShowPasswordReset} />
    </div>
  );
}
