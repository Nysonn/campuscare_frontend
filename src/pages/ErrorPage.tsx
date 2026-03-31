import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';

interface ErrorPageProps {
  onRetry?: () => void;
}

export default function ErrorPage({ onRetry }: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-50 flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 w-125 h-125 bg-primary-100 rounded-full blur-3xl opacity-40"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 w-100 h-100 bg-primary-200 rounded-full blur-3xl opacity-30"
        aria-hidden="true"
      />
      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #15803d 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border border-primary-100 shadow-md mb-6">
          <AlertTriangle className="text-primary-500" size={36} strokeWidth={1.5} />
        </div>

        {/* Status code */}
        <p className="text-xs font-semibold tracking-widest uppercase text-primary-500 mb-2">
          500 &mdash; Server Error
        </p>

        {/* Heading */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
          Something went wrong
        </h1>

        {/* Body */}
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          We're having a little trouble on our end right now. Our team has been
          notified and we're working quickly to fix it. Please try again in a
          moment.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="primary" size="lg">
              <RefreshCw size={16} />
              Try Again
            </Button>
          )}
          <Button onClick={() => navigate('/')} variant="outline" size="lg">
            <Home size={16} />
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
