import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Step {
  title: string;
  description: string;
  details: string[];
}

const steps: Step[] = [
  {
    title: 'Create Your Account',
    description: 'Sign up for a free account to get started',
    details: [
      'Click "Sign Up" on the landing page',
      'Enter your email and create a password',
      'Verify your email address',
      'Complete your profile setup',
    ],
  },
  {
    title: 'Create Your First Agent',
    description: 'Build a conversational form agent',
    details: [
      'Click "Create Agent" from your dashboard',
      'Define the fields you want to collect (name, email, etc.)',
      'Set validation rules for each field',
      'Choose which fields are required',
    ],
  },
  {
    title: 'Configure Persona & Tone',
    description: 'Customize how your agent communicates',
    details: [
      'Write a persona description',
      'Select a tone (friendly, professional, casual)',
      'Add sample messages to guide the conversation',
      'Preview how your agent will interact',
    ],
  },
  {
    title: 'Add Knowledge Base (Optional)',
    description: 'Provide context for your agent',
    details: [
      'Paste relevant information or FAQs',
      'Enable RAG (Retrieval Augmented Generation)',
      'Set citation preferences',
      'Test knowledge retrieval',
    ],
  },
  {
    title: 'Customize Visuals',
    description: 'Brand your agent with colors and assets',
    details: [
      'Choose a primary color',
      'Upload a logo or avatar',
      'Write a welcome message',
      'Preview the public interface',
    ],
  },
  {
    title: 'Publish & Share',
    description: 'Make your agent live and shareable',
    details: [
      'Choose a unique URL slug',
      'Configure optional email OTP gating',
      'Set up webhooks for data delivery',
      'Copy and share your public link',
    ],
  },
];

export function GettingStartedSteps() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Getting Started Guide
        </h2>
        <p className="text-muted-foreground">
          Follow these steps to create and publish your first conversational AI agent form
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 pt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
