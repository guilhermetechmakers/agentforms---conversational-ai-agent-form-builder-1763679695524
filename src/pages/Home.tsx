import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Zap, Shield, BarChart3, ArrowRight, Check } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">AgentForms</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/help" className="text-sm text-muted hover:text-foreground transition-colors">
                Help
              </Link>
              <Link to="/login" className="text-sm text-muted hover:text-foreground transition-colors">
                Login
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-h1 mb-6 text-foreground">
            Build Conversational AI Forms That Collect Structured Data
          </h1>
          <p className="text-xl text-muted mb-8 leading-relaxed">
            Create public, shareable chat-based agents to collect structured data. 
            Define schemas, set personas, and let AI guide conversations naturally.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="text-base px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/agent/demo">
              <Button variant="outline" size="lg" className="text-base px-8">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-h2 mb-4">Powerful Features</h2>
          <p className="text-muted text-lg">Everything you need to build and deploy conversational forms</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="animate-fade-in-up">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Conversational Interface</CardTitle>
              <CardDescription>
                Natural, AI-driven conversations that guide users through form completion
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Schema Builder</CardTitle>
              <CardDescription>
                Define fields, validation rules, and data structure with an intuitive visual editor
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Field-level encryption, data retention policies, and GDPR compliance built-in
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Analytics & Insights</CardTitle>
              <CardDescription>
                Track completion rates, session analytics, and export data in multiple formats
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-h2 mb-4">See It In Action</h2>
          <p className="text-muted text-lg">Try our interactive demo to experience the power of conversational forms</p>
        </div>
        <Card className="max-w-4xl mx-auto animate-fade-in-up">
          <CardHeader>
            <CardTitle>Live Demo Agent</CardTitle>
            <CardDescription>This is a sample agent collecting lead qualification data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-surface rounded-lg p-8 min-h-[400px] flex items-center justify-center">
              <p className="text-muted">Demo agent preview would be embedded here</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pricing Teaser */}
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-h2 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted text-lg">Start free, scale as you grow</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="animate-fade-in-up">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">3 agents</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">100 sessions/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">Basic analytics</span>
                </li>
              </ul>
              <Link to="/signup" className="block mt-6">
                <Button variant="outline" className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in-up border-primary" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-muted">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">Unlimited agents</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">5,000 sessions/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">Webhooks & API</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
              </ul>
              <Link to="/signup" className="block mt-6">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <div className="mt-4">
                <span className="text-3xl font-bold">Custom</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">Unlimited sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">SSO & SAML</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-sm">Dedicated support</span>
                </li>
              </ul>
              <Link to="/signup" className="block mt-6">
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-24">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <span className="font-bold text-foreground">AgentForms</span>
              </div>
              <p className="text-sm text-muted">
                Build conversational AI forms that collect structured data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><Link to="/help" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">API Reference</Link></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><Link to="/help" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted">
            <p>© 2024 AgentForms. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
