import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  popular?: boolean;
}

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "month",
    description: "Perfect for getting started",
    features: [
      "3 agents",
      "100 sessions/month",
      "Basic analytics",
      "Email support",
      "Public agent links",
    ],
    cta: "Get Started Free",
    ctaLink: "/signup",
  },
  {
    name: "Pro",
    price: "$29",
    period: "month",
    description: "For growing teams",
    features: [
      "Unlimited agents",
      "5,000 sessions/month",
      "Webhooks & API access",
      "Advanced analytics",
      "Custom branding",
      "Priority support",
      "Data export (CSV/JSON)",
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Unlimited sessions",
      "SSO & SAML authentication",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "On-premise deployment option",
    ],
    cta: "Contact Sales",
    ctaLink: "/signup?plan=enterprise",
  },
];

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const getPrice = (tier: PricingTier) => {
    if (tier.price === "Custom") return tier.price;
    if (billingPeriod === "yearly" && tier.price !== "$0") {
      const monthlyPrice = parseInt(tier.price.replace("$", ""));
      const yearlyPrice = Math.round(monthlyPrice * 12 * 0.83); // 17% discount
      return `$${yearlyPrice}`;
    }
    return tier.price;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Start free, scale as you grow. All plans include a 14-day free trial.
          </DialogDescription>
        </DialogHeader>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 py-4">
          <span className={`text-sm ${billingPeriod === "monthly" ? "font-semibold text-foreground" : "text-muted"}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            role="switch"
            aria-checked={billingPeriod === "yearly"}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingPeriod === "yearly" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm ${billingPeriod === "yearly" ? "font-semibold text-foreground" : "text-muted"}`}>
            Yearly
            <span className="ml-1 text-xs text-success">Save 17%</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {pricingTiers.map((tier, index) => (
            <Card
              key={tier.name}
              className={`relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                tier.popular ? "border-primary border-2 shadow-lg" : ""
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
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
                  <span className="text-4xl font-bold">{getPrice(tier)}</span>
                  {tier.period && tier.price !== "Custom" && (
                    <span className="text-muted ml-2">
                      /{billingPeriod === "yearly" ? "year" : tier.period}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted mt-2">{tier.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to={tier.ctaLink} onClick={() => onOpenChange(false)}>
                  <Button
                    variant={tier.popular ? "default" : "outline"}
                    className="w-full"
                    size="lg"
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted mt-6">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </DialogContent>
    </Dialog>
  );
}
