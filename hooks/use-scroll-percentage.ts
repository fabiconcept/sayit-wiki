import { useEffect } from 'react';

export function useScrollPercentage(ref: React.RefObject<HTMLElement>, percentage = 60, callback: () => void) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let hasTriggered = false;

    const handleScroll = () => {
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;

      // Calculate scroll percentage
      const scrollableHeight = scrollHeight - clientHeight;
      const currentScrollPercentage = (scrollTop / scrollableHeight) * 100;

      // Trigger callback when reaching the percentage
      if (currentScrollPercentage >= percentage && !hasTriggered) {
        hasTriggered = true;
        callback();
      }

      // Reset if scrolled back up (optional)
      if (currentScrollPercentage < percentage) {
        hasTriggered = false;
      }
    };

    element.addEventListener('scroll', handleScroll);

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [ref, percentage, callback]);
}