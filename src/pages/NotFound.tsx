import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Home, ArrowLeft, MessageSquare, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLog404Error } from '@/hooks/useErrors';

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const log404Error = useLog404Error();

  // Log the 404 error when component mounts
  useEffect(() => {
    log404Error.mutate({
      url: location.pathname + location.search,
      userAgent: navigator.userAgent,
    });
  }, [location.pathname, location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Simple search - navigate to help page with query
      navigate(`/help?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const quickLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Help Center', path: '/help', icon: HelpCircle },
    { label: 'Home', path: '/', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Animated 404 Number */}
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="text-8xl md:text-9xl font-bold text-primary mb-4 animate-bounce-in">
            404
          </h1>
          <h2 className="text-h2 mb-3 animate-fade-in-up animation-delay-2000">
            Page Not Found
          </h2>
          <p className="text-muted text-lg animate-fade-in-up animation-delay-4000">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-6 animate-fade-in-up animation-delay-4000 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search for what you need
            </CardTitle>
            <CardDescription>
              Try searching for the page or feature you're looking for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search pages, features, or help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="shrink-0">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in-up animation-delay-4000">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="group"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/50">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Icon className="h-8 w-8 text-primary mb-3 transition-transform group-hover:scale-110" />
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {link.label}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-4000">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button
            asChild
            className="w-full sm:w-auto"
          >
            <Link to="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Helpful Message */}
        <div className="mt-8 text-center text-sm text-muted animate-fade-in-up animation-delay-4000">
          <p>
            If you believe this is an error, please{' '}
            <Link to="/help" className="text-primary-variant hover:underline font-medium">
              contact support
            </Link>
            {' '}and let us know what you were trying to access.
          </p>
        </div>
      </div>
    </div>
  );
}
