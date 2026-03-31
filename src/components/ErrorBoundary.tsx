import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console in dev; swap for a real error reporting service if needed
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

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
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, #15803d 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border border-primary-100 shadow-md mb-6">
            <AlertTriangle className="text-primary-500" size={36} strokeWidth={1.5} />
          </div>

          <p className="text-xs font-semibold tracking-widest uppercase text-primary-500 mb-2">
            Unexpected Error
          </p>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
            Something went wrong
          </h1>

          <p className="text-gray-500 text-base leading-relaxed mb-8">
            We're having a little trouble on our end right now. Our team has
            been notified and we're working quickly to fix it. Please try again
            in a moment.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 rounded-full font-medium px-7 py-3 text-base bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full font-medium px-7 py-3 text-base border border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Home size={16} />
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
