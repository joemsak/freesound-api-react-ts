import { Link } from 'react-router-dom';
import { type SoundCollection } from '../services/freesound';
import { calculatePageNumbers } from '../utils/pagination';
import { buildSearchUrl, buildUserUrl, buildTagUrl } from '../utils/url';
import { PAGE_SIZE, MAX_VISIBLE_PAGES } from '../constants';

interface PaginationProps {
  sounds: SoundCollection;
  currentPage: number;
  urlQuery: string;
  loading: boolean;
  onPageChange: (page: number) => void;
  isUserProfile?: boolean;
  isTagSearch?: boolean;
}

export function Pagination({
  sounds,
  currentPage,
  urlQuery,
  loading,
  onPageChange,
  isUserProfile = false,
  isTagSearch = false,
}: PaginationProps) {
  const totalPages = Math.ceil(sounds.count / PAGE_SIZE);
  const pageNumbers = calculatePageNumbers(currentPage, totalPages, MAX_VISIBLE_PAGES);

  const buildPageUrl = (page: number): string => {
    if (isUserProfile) {
      return buildUserUrl(urlQuery, page);
    }
    if (isTagSearch) {
      return buildTagUrl(urlQuery, page);
    }
    return buildSearchUrl(urlQuery, page);
  };

  if (sounds.count === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex justify-center items-center gap-2 flex-wrap">
      {/* Previous Button */}
      {sounds.previous && (
        <Link
          to={buildPageUrl(currentPage - 1)}
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
            to={buildPageUrl(pageNum)}
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
          to={buildPageUrl(currentPage + 1)}
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

