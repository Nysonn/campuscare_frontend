import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function ScrollToTopBottom() {
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      setShowTop(scrolled > 300);
      setShowBottom(scrolled < maxHeight - 300);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ 
      top: document.documentElement.scrollHeight, 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 flex flex-col gap-3 z-40">
      {showTop && (
        <button
          onClick={scrollToTop}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white dark:bg-gray-800 text-primary-600 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:bg-primary-50 dark:hover:bg-gray-700 transition-all active:scale-90"
          title="Scroll to Top"
        >
          <ArrowUp size={20} />
        </button>
      )}
      {showBottom && (
        <button
          onClick={scrollToBottom}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white dark:bg-gray-800 text-primary-600 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center hover:bg-primary-50 dark:hover:bg-gray-700 transition-all active:scale-90"
          title="Scroll to Bottom"
        >
          <ArrowDown size={20} />
        </button>
      )}
    </div>
  );
}
