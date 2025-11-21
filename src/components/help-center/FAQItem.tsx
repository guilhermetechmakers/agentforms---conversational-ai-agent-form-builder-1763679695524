import { useState } from 'react';
import { ChevronDown, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { FAQRow } from '@/types/database/faq';
import { useIncrementFAQView, useSubmitFAQFeedback } from '@/hooks/useHelpCenter';

interface FAQItemProps {
  faq: FAQRow;
  defaultOpen?: boolean;
}

export function FAQItem({ faq, defaultOpen = false }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const { mutate: incrementView } = useIncrementFAQView();
  const { mutate: submitFeedback } = useSubmitFAQFeedback();

  const handleToggle = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    
    if (newOpen && faq.view_count === 0) {
      // Track view on first open
      incrementView(faq.id);
    }
  };

  const handleFeedback = (helpful: boolean) => {
    if (feedbackSubmitted) return;
    
    setFeedbackSubmitted(true);
    submitFeedback({ id: faq.id, isHelpful: helpful });
  };

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-surface/50 transition-colors duration-200 rounded-lg px-2 -mx-2"
        aria-expanded={isOpen}
      >
        <h3 className="text-base font-semibold text-foreground pr-4">
          {faq.question}
        </h3>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      
      {isOpen && (
        <div className="pb-4 pl-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="leading-relaxed whitespace-pre-line">{faq.answer}</p>
          </div>
          
          {!feedbackSubmitted ? (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Was this helpful?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(true)}
                className="h-8 px-2"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Yes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(false)}
                className="h-8 px-2"
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                No
              </Button>
            </div>
          ) : (
            <div className="mt-4 text-sm text-muted-foreground">
              Thank you for your feedback!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
