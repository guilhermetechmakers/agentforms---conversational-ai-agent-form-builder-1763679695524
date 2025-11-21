import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

/**
 * ProtectedRoute component that ensures user is authenticated
 * and optionally verified before accessing protected routes
 */
export function ProtectedRoute({
  children,
  requireEmailVerification = false,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { data: user, isLoading, isError } = useUser();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (isError || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check email verification if required
  if (requireEmailVerification && !user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
}
