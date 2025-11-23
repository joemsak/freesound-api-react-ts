interface SearchResultsHeaderProps {
  count: number;
  currentPage: number;
  pageSize?: number;
}

export function SearchResultsHeader({
  count,
  currentPage,
  pageSize = 10,
}: SearchResultsHeaderProps) {
  const totalPages = Math.ceil(count / pageSize);

  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-gray-600">
        Found {count.toLocaleString()} sounds
      </p>
      {count > 0 && (
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages.toLocaleString()}
        </p>
      )}
    </div>
  );
}

