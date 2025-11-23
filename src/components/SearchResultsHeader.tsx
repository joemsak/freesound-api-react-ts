import { PAGE_SIZE } from '../constants';

interface SearchResultsHeaderProps {
  count: number;
  currentPage: number;
  pageSize?: number;
  query?: string;
}

export function SearchResultsHeader({
  count,
  currentPage,
  pageSize = PAGE_SIZE,
  query,
}: SearchResultsHeaderProps) {
  const totalPages = Math.ceil(count / pageSize);

  const resultText = count === 1 ? 'result' : 'results';

  return (
    <div className="mb-4">
      {query && (
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Showing {count.toLocaleString()} {resultText} for "{query}"
        </h2>
      )}
      {!query && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Found {count.toLocaleString()} sounds
          </p>
          {count > 0 && (
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages.toLocaleString()}
            </p>
          )}
        </div>
      )}
      {query && count > 0 && (
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages.toLocaleString()}
        </p>
      )}
    </div>
  );
}

