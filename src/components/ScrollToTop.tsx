import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Find the scrolling container (the main content area)
    const scrollContainer = document.querySelector(
      '.h-screen.overflow-y-auto'
    ) as HTMLElement;

    if (scrollContainer) {
      const onScroll = () => {
        const scrollTop = scrollContainer.scrollTop;
        setShowScrollTop(scrollTop > 300);
      };

      scrollContainer.addEventListener('scroll', onScroll, { passive: true });
      return () => scrollContainer.removeEventListener('scroll', onScroll);
    } else {
      // Fallback to window scroll
      const onScroll = () => {
        const y =
          window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop;
        setShowScrollTop(y > 300);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, []);

  const scrollToTop = () => {
    // Find the scrolling container (the main content area)
    const scrollContainer = document.querySelector(
      '.h-screen.overflow-y-auto'
    ) as HTMLElement;

    if (scrollContainer) {
      // Scroll the container to top
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      // Fallback to window scroll
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  if (!showScrollTop) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 z-50"
      aria-label="Scroll to top"
    >
      <ArrowUp size={24} />
    </button>
  );
}
