import { Component } from 'react';
import Link from 'next/link';
import { FiAlertTriangle } from 'react-icons/fi';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to your error tracking service (Sentry, LogRocket, etc.)
    console.error('[ErrorBoundary]', error, errorInfo);
    // In production: Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-4 flex justify-center">
              <FiAlertTriangle size={56} className="text-amber-500" />
            </div>
            <h2 className="font-head text-2xl font-bold text-stone-900 dark:text-neutral-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-stone-500 dark:text-neutral-500 text-sm mb-6 leading-relaxed">
              An unexpected error occurred. Our team has been notified.
              Please try refreshing the page or go back to the homepage.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn-secondary"
              >
                Try Again
              </button>
              <Link href="/" className="btn-primary">← Home</Link>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-stone-400 cursor-pointer hover:text-stone-600">Error details</summary>
                <pre className="mt-2 p-3 bg-stone-100 dark:bg-neutral-900 rounded text-xs text-red-600 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
