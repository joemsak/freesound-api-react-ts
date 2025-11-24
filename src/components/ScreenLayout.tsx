import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import { SoundDetailSkeleton } from './SoundDetailSkeleton';

interface ScreenLayoutProps {
  loading: boolean;
  error: string | null;
  hasData: boolean;
  emptyMessage?: string;
  showBackLink?: boolean;
  children: ReactNode;
}

export function ScreenLayout({
  loading,
  error,
  hasData,
  emptyMessage,
  showBackLink = true,
  children,
}: ScreenLayoutProps) {
  if (loading && !hasData) {
    return <SoundDetailSkeleton />;
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

