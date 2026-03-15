import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-primary-600 text-white px-5 py-3.5 rounded-2xl shadow-xl animate-slide-up whitespace-nowrap">
      <CheckCircle size={20} className="shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
