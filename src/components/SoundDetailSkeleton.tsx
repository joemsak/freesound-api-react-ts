export function SoundDetailSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        {/* Title Skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 ml-4"></div>
        </div>

        {/* Waveform Skeleton */}
        <div className="mb-6">
          <div className="h-24 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>

        {/* Metadata Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Description Skeleton */}
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>

        {/* Tags Skeleton */}
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="flex gap-2">
            <div className="h-7 bg-gray-200 rounded-full w-16"></div>
            <div className="h-7 bg-gray-200 rounded-full w-20"></div>
            <div className="h-7 bg-gray-200 rounded-full w-14"></div>
            <div className="h-7 bg-gray-200 rounded-full w-18"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

