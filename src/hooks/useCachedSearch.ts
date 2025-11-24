import { useState, useEffect } from 'react';
import { type SoundCollection, type SoundObject } from '../services/freesound';
import { useSoundCache } from '../contexts/SoundCacheContext';

interface UseCachedSearchOptions {
  cacheKey: string;
  page: number;
  searchFn: (
    success: (data: SoundCollection) => void,
    error: (err: unknown) => void
  ) => void;
  onSuccess?: (data: SoundCollection) => void;
  onError?: (err: unknown) => void;
}

interface UseCachedSearchResult {
  data: SoundCollection | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for cached search operations
 * Automatically checks cache first, then makes API call if needed
 */
export function useCachedSearch({
  cacheKey,
  page,
  searchFn,
  onSuccess,
  onError,
}: UseCachedSearchOptions): UseCachedSearchResult {
  const { getSearchResults, setSearchResults, setSound } = useSoundCache();
  const [data, setData] = useState<SoundCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check cache first
    const cachedResults = getSearchResults(cacheKey, page);
    if (cachedResults) {
      setData(cachedResults);
      setLoading(false);
      if (onSuccess) {
        onSuccess(cachedResults);
      }
      return;
    }

    // Not in cache, make API call
    setLoading(true);
    setError(null);

    searchFn(
      (apiData: SoundCollection) => {
        setData(apiData);
        setSearchResults(cacheKey, page, apiData);
        setLoading(false);
        
        // Cache individual sounds
        // Note: Search results return SoundData, but we cast to SoundObject for caching
        // The cache only stores data properties, not methods
        apiData.results.forEach((sound) => {
          setSound(sound as SoundObject);
        });
        
        if (onSuccess) {
          onSuccess(apiData);
        }
      },
      (err: unknown) => {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
        if (onError) {
          onError(err);
        }
      }
    );
  }, [cacheKey, page, getSearchResults, setSearchResults, setSound, searchFn, onSuccess, onError]);

  return { data, loading, error };
}

