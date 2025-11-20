import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "Product Marketing Manager",
    company: "TechCorp",
    content:
      "AgentForms has transformed how we collect lead information. The conversational interface makes it feel natural, and our conversion rates have increased by 40%.",
    rating: 5,
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    role: "Founder",
    company: "StartupXYZ",
    content:
      "Setting up our first agent took less than 10 minutes. The schema builder is intuitive, and the webhook integration works flawlessly. Highly recommended!",
    rating: 5,
  },
  {
    id: "3",
    name: "Emily Johnson",
    role: "Customer Success Lead",
    company: "GrowthCo",
    content:
      "The analytics dashboard gives us incredible insights into how users interact with our forms. The data export feature saves us hours every week.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-surface">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-h2 mb-4">Loved by Teams Worldwide</h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            See what our customers are saying about AgentForms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-warning text-warning"
                    />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                <p className="text-sm text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Company Logos */}
        <div className="mt-16 pt-12 border-t border-border">
          <p className="text-center text-sm text-muted mb-8">
            Trusted by innovative companies
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
            {["TechCorp", "StartupXYZ", "GrowthCo", "InnovateLabs", "ScaleUp"].map(
              (company) => (
                <div
                  key={company}
                  className="text-muted font-semibold text-lg"
                >
                  {company}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
