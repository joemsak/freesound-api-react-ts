import { SoundCardSkeleton } from './SoundCardSkeleton';

interface SearchResultsSkeletonProps {
  count?: number;
}

export function SearchResultsSkeleton({ count = 6 }: SearchResultsSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
      {Array.from({ length: count }).map((_, index) => (
        <SoundCardSkeleton key={index} />
      ))}
    </div>
  );
}

