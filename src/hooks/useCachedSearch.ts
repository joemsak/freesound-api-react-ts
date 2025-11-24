import { useReducer, useEffect, useRef } from 'react';
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

type State = {
  data: SoundCollection | null;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: 'SET_CACHED_DATA'; payload: SoundCollection }
  | { type: 'SET_API_DATA'; payload: SoundCollection }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CACHED_DATA':
      return { ...state, data: action.payload, loading: false, error: null };
    case 'SET_API_DATA':
      return { ...state, data: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'RESET':
      return { data: null, loading: true, error: null };
    default:
      return state;
  }
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
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  // Keep refs up to date
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);
  
  // Initialize state from cache using lazy initializer
  const [state, dispatch] = useReducer(reducer, null, () => {
    const cached = getSearchResults(cacheKey, page);
    return {
      data: cached,
      loading: !cached,
      error: null,
    };
  });

  useEffect(() => {
    // Check if cache changed
    const cached = getSearchResults(cacheKey, page);
    
    // If we have cached data and it matches what we have, we're done
    if (cached && cached === state.data) {
      if (onSuccessRef.current) {
        onSuccessRef.current(cached);
      }
      return;
    }
    
    // If cache exists but doesn't match current data, update it
    if (cached) {
      dispatch({ type: 'SET_CACHED_DATA', payload: cached });
      if (onSuccessRef.current) {
        onSuccessRef.current(cached);
      }
      return;
    }

    // Not in cache, make API call
    dispatch({ type: 'SET_LOADING', payload: true });

    searchFn(
      (apiData: SoundCollection) => {
        dispatch({ type: 'SET_API_DATA', payload: apiData });
        setSearchResults(cacheKey, page, apiData);
        
        // Cache individual sounds
        // Note: Search results return SoundData, but we cast to SoundObject for caching
        // The cache only stores data properties, not methods
        apiData.results.forEach((sound) => {
          setSound(sound as SoundObject);
        });
        
        if (onSuccessRef.current) {
          onSuccessRef.current(apiData);
        }
      },
      (err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        if (onErrorRef.current) {
          onErrorRef.current(err);
        }
      }
    );
  }, [cacheKey, page, getSearchResults, setSearchResults, setSound, searchFn, state.data]);

  return { data: state.data, loading: state.loading, error: state.error };
}

