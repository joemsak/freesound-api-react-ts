import { Link } from 'react-router-dom';
import { type SoundCollection } from '../services/freesound';

interface PaginationProps {
  sounds: SoundCollection;
  currentPage: number;
  urlQuery: string;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  sounds,
  currentPage,
  urlQuery,
  loading,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(sounds.count / 10);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (sounds.count === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex justify-center items-center gap-2 flex-wrap">
      {/* Previous Button */}
      {sounds.previous && (
        <Link
          to={`/?q=${encodeURIComponent(urlQuery)}&page=${currentPage - 1}`}
          onClick={(e) => {
            e.preventDefault();
            if (loading) return;
            onPageChange(currentPage - 1);
          }}
          className={`px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Previous
        </Link>
      )}

      {/* Page Numbers */}
      {pageNumbers.map((page, idx) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-500">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <Link
            key={pageNum}
            to={`/?q=${encodeURIComponent(urlQuery)}&page=${pageNum}`}
            onClick={(e) => {
              e.preventDefault();
              if (loading || isActive) return;
              onPageChange(pageNum);
            }}
            className={`px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {pageNum}
          </Link>
        );
      })}

      {/* Next Button */}
      {sounds.next && (
        <Link
          to={`/?q=${encodeURIComponent(urlQuery)}&page=${currentPage + 1}`}
          onClick={(e) => {
            e.preventDefault();
            if (loading) return;
            onPageChange(currentPage + 1);
          }}
          className={`px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next
        </Link>
      )}
    </div>
  );
}

