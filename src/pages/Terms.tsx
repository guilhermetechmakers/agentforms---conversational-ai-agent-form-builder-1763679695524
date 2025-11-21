import { useEffect } from 'react';
import PrivacyTerms from './PrivacyTerms';

export default function Terms() {
  useEffect(() => {
    // Scroll to terms section on mount
    setTimeout(() => {
      const element = document.getElementById('terms');
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 100);
  }, []);

  return <PrivacyTerms />;
}
