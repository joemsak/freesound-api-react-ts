import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';

interface ScreenLayoutProps {
  loading: boolean;
  error: string | null;
  hasData: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  showBackLink?: boolean;
  children: ReactNode;
}

export function ScreenLayout({
  loading,
  error,
  hasData,
  loadingMessage = 'Loading...',
  emptyMessage,
  showBackLink = true,
  children,
}: ScreenLayoutProps) {
  if (loading && !hasData) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <LoadingSpinner message={loadingMessage} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <ErrorMessage message={error} className="mb-4" />
          {showBackLink && (
            <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
              ← Back to Search
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!hasData && !loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {emptyMessage && <EmptyState message={emptyMessage} />}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

