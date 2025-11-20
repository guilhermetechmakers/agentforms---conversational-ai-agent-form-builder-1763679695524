import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Check,
  Sparkles,
  Globe,
  Webhook,
} from "lucide-react";
import { PricingModal } from "@/components/landing/PricingModal";
import { LiveDemoPanel } from "@/components/landing/LiveDemoPanel";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { useLandingPageTracking } from "@/hooks/useLandingPageTracking";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const { trackCTA, trackConversionStatus } = useLandingPageTracking();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const createObserver = (ref: React.RefObject<HTMLElement>, sectionId: string) => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => new Set(prev).add(sectionId));
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
      );

      observer.observe(ref.current);
      observers.push(observer);
    };

    createObserver(heroRef, "hero");
    createObserver(featuresRef, "features");
    createObserver(demoRef, "demo");
    createObserver(pricingRef, "pricing");

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const handleCTAClick = (ctaId: string, section: string, action?: () => void) => {
    trackCTA(ctaId, section);
    if (action) action();
  };

  const handleSignupClick = () => {
    trackConversionStatus("signup_clicked");
  };

  const handleDemoClick = () => {
    trackConversionStatus("demo_started");
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Conversational Interface",
      description:
        "Natural, AI-driven conversations that guide users through form completion with contextual understanding.",
      gradient: "from-blue-500/10 to-indigo-500/10",
    },
    {
      icon: Zap,
      title: "Schema Builder",
      description:
        "Define fields, validation rules, and data structure with an intuitive visual editor. Drag-and-drop ordering and real-time preview.",
      gradient: "from-purple-500/10 to-pink-500/10",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Field-level encryption, data retention policies, GDPR compliance, and audit logs built-in from day one.",
      gradient: "from-green-500/10 to-emerald-500/10",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description:
        "Track completion rates, session analytics, export data in multiple formats, and get real-time webhook notifications.",
      gradient: "from-orange-500/10 to-red-500/10",
    },
    {
      icon: Webhook,
      title: "Webhooks & API",
      description:
        "Integrate seamlessly with your existing tools. Real-time webhook delivery with retry logic and delivery logs.",
      gradient: "from-cyan-500/10 to-blue-500/10",
    },
    {
      icon: Globe,
      title: "Public Links",
      description:
        "Share your agents via unique public URLs. Optional OTP gating, custom branding, and white-label options available.",
      gradient: "from-violet-500/10 to-purple-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5 animate-pulse" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-variant/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
                AgentForms
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/help"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Help
              </Link>
              <Link
                to="/login"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link to="/signup" onClick={handleSignupClick}>
                <Button
                  onClick={() =>
                    handleCTAClick("nav-signup", "navigation", handleSignupClick)
                  }
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative container mx-auto px-4 py-24 md:py-32 max-w-7xl"
      >
        <div
          className={cn(
            "text-center max-w-5xl mx-auto transition-all duration-1000",
            visibleSections.has("hero")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          )}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Build conversational forms powered by AI
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
            Build Conversational AI Forms That{" "}
            <span className="bg-gradient-to-r from-primary to-primary-variant bg-clip-text text-transparent">
              Collect Structured Data
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted mb-10 leading-relaxed max-w-3xl mx-auto">
            Create public, shareable chat-based agents to collect structured data. Define
            schemas, set personas, and let AI guide conversations naturally.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/signup" onClick={handleSignupClick}>
              <Button
                size="lg"
                className="text-base px-8 h-14 group"
                onClick={() => handleCTAClick("hero-signup", "hero", handleSignupClick)}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/agent/demo" onClick={handleDemoClick}>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 h-14"
                onClick={() => handleCTAClick("hero-demo", "hero", handleDemoClick)}
              >
                Try Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted">Active Agents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">1M+</div>
              <div className="text-sm text-muted">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="container mx-auto px-4 py-24 max-w-7xl"
      >
        <div
          className={cn(
            "text-center mb-16 transition-all duration-1000",
            visibleSections.has("features")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-h2 mb-4">Powerful Features</h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Everything you need to build and deploy conversational forms that convert
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className={cn(
                  "group transition-all duration-500 hover:shadow-xl hover:-translate-y-2",
                  visibleSections.has("features")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div
                    className={cn(
                      "h-14 w-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                      feature.gradient
                    )}
                  >
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Live Demo Section */}
      <section
        ref={demoRef}
        className="container mx-auto px-4 py-24 max-w-7xl"
      >
        <div
          className={cn(
            "text-center mb-12 transition-all duration-1000",
            visibleSections.has("demo")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-h2 mb-4">See It In Action</h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Try our interactive demo to experience the power of conversational forms
          </p>
        </div>

        <div
          className={cn(
            "transition-all duration-1000",
            visibleSections.has("demo")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          )}
          style={{ transitionDelay: "200ms" }}
        >
          <LiveDemoPanel />
        </div>
      </section>

      {/* Pricing Teaser */}
      <section
        ref={pricingRef}
        className="container mx-auto px-4 py-24 max-w-7xl"
      >
        <div
          className={cn(
            "text-center mb-12 transition-all duration-1000",
            visibleSections.has("pricing")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          )}
        >
          <h2 className="text-h2 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Start free, scale as you grow. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: "Free",
              price: "$0",
              period: "month",
              features: ["3 agents", "100 sessions/month", "Basic analytics"],
              cta: "Get Started",
              popular: false,
            },
            {
              name: "Pro",
              price: "$29",
              period: "month",
              features: [
                "Unlimited agents",
                "5,000 sessions/month",
                "Webhooks & API",
                "Advanced analytics",
              ],
              cta: "Start Free Trial",
              popular: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              period: "",
              features: [
                "Everything in Pro",
                "Unlimited sessions",
                "SSO & SAML",
                "Dedicated support",
              ],
              cta: "Contact Sales",
              popular: false,
            },
          ].map((tier, index) => (
            <Card
              key={tier.name}
              className={cn(
                "relative transition-all duration-500 hover:shadow-xl hover:-translate-y-2",
                tier.popular && "border-primary border-2 shadow-lg",
                visibleSections.has("pricing")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-muted ml-2">/{tier.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-success flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.popular ? "default" : "outline"}
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    handleCTAClick(`pricing-${tier.name.toLowerCase()}`, "pricing", () => {
                      setPricingModalOpen(true);
                    });
                  }}
                >
                  {tier.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-24">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">AgentForms</span>
              </div>
              <p className="text-sm text-muted">
                Build conversational AI forms that collect structured data.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link to="/help" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-foreground transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-foreground transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link to="/help" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <Link to="/privacy" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted">
            <p>© 2024 AgentForms. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Pricing Modal */}
      <PricingModal open={pricingModalOpen} onOpenChange={setPricingModalOpen} />
    </div>
  );
}
