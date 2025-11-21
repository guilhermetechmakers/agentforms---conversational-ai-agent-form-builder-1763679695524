import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Toaster as RadixToaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import EmailVerification from "@/pages/EmailVerification";
import PasswordReset from "@/pages/PasswordReset";
import Dashboard from "@/pages/Dashboard";
import AgentBuilder from "@/pages/AgentBuilder";
import PublicAgentSession from "@/pages/PublicAgentSession";
import SessionViewer from "@/pages/SessionViewer";
import AgentSessionsList from "@/pages/AgentSessionsList";
import WebhookSettings from "@/pages/WebhookSettings";
import Settings from "@/pages/Settings";
import AdminDashboard from "@/pages/AdminDashboard";
import Help from "@/pages/Help";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import ServerError from "@/pages/ServerError";
import Billing from "@/pages/Billing";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path="/help" element={<Help />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Public agent session */}
          <Route path="/agent/:slug" element={<PublicAgentSession />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireEmailVerification>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/new"
            element={
              <ProtectedRoute requireEmailVerification>
                <AgentBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/:id/edit"
            element={
              <ProtectedRoute requireEmailVerification>
                <AgentBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/:id/sessions"
            element={
              <ProtectedRoute requireEmailVerification>
                <AgentSessionsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/session/:id"
            element={
              <ProtectedRoute requireEmailVerification>
                <SessionViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/webhooks"
            element={
              <ProtectedRoute requireEmailVerification>
                <WebhookSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requireEmailVerification>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireEmailVerification>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute requireEmailVerification>
                <Billing />
              </ProtectedRoute>
            }
          />
          
          {/* Error pages */}
          <Route path="/error" element={<ServerError />} />
          <Route path="/500" element={<ServerError />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
      <RadixToaster />
    </QueryClientProvider>
  );
}
