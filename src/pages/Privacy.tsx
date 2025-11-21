import { useEffect } from 'react';
import PrivacyTerms from './PrivacyTerms';

export default function Privacy() {

  useEffect(() => {
    // Scroll to privacy section if hash is present
    if (window.location.hash) {
      setTimeout(() => {
        const element = document.querySelector(window.location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  return <PrivacyTerms />;
}
