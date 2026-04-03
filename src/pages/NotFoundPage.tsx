import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import SEO from '../components/seo/SEO';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-50 flex flex-col items-center justify-center overflow-hidden px-4">
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Return to CampusCare and find mental health resources, student campaigns, or book a counselling session."
        noindex
      />
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
        {/* Large 404 */}
        <div className="relative mb-4 select-none">
          <span className="font-display text-[9rem] sm:text-[12rem] font-bold leading-none text-primary-100 tracking-tight">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white border border-primary-100 shadow-md">
              <Search className="text-primary-500" size={28} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
          Page not found
        </h1>

        {/* Body */}
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back to somewhere familiar.
        </p>

        {/* Action */}
        <Link to="/">
          <Button variant="primary" size="lg">
            <Home size={16} />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
