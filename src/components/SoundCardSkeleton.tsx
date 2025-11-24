export function SoundCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col h-full animate-pulse">
      {/* Favorite Button Skeleton */}
      <div className="absolute top-4 right-4 z-10">
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
      </div>
      
      {/* Content Section */}
      <div className="flex-1 flex flex-col">
        {/* Title Skeleton */}
        <div className="mb-2 pr-8">
          <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Tags Skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-14"></div>
        </div>
        
        {/* Duration Skeleton */}
        <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
      </div>

      {/* Audio Player Skeleton */}
      <div className="mt-auto">
        {/* Waveform Skeleton */}
        <div className="mb-2 h-12 bg-gray-200 rounded"></div>
        {/* Audio Controls Skeleton */}
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

