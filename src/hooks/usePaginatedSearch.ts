import { useState, useEffect, useCallback, useRef } from 'react';
import { type SoundCollection } from '../services/freesound';
import { useSoundCache } from '../contexts/SoundCacheContext';
import { extractErrorMessage } from '../utils/errorHandler';

interface UsePaginatedSearchOptions {
  cacheKey: string;
  searchFn: (
    success: (data: SoundCollection) => void,
    error: (err: unknown) => void
  ) => void;
  defaultErrorMessage: string;
  page: number;
}

interface UsePaginatedSearchResult {
  sounds: SoundCollection | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
}

export function usePaginatedSearch({
  cacheKey,
  searchFn,
  defaultErrorMessage,
  page,
}: UsePaginatedSearchOptions): UsePaginatedSearchResult {
  const { getSearchResults, setSearchResults } = useSoundCache();

  const [sounds, setSounds] = useState<SoundCollection | null>(() => {
    return getSearchResults(cacheKey, page) || null;
  });
  const [loading, setLoading] = useState(() => {
    return true;
  });
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const searchFnRef = useRef(searchFn);
  const defaultErrorMessageRef = useRef(defaultErrorMessage);
  const previousCacheKeyRef = useRef<string | undefined>(undefined);
  const previousPageRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    searchFnRef.current = searchFn;
    defaultErrorMessageRef.current = defaultErrorMessage;
  }, [searchFn, defaultErrorMessage]);

  const navigateToPage = useCallback(
    (data: SoundCollection, targetPage: number) => {
      if (targetPage > 1 && data.next) {
        let currentData = data;
        let currentPageNum = 1;

        const navigateForward = () => {
          if (currentPageNum < targetPage && currentData.next) {
            currentPageNum++;
            currentData.nextPage(
              (nextData: SoundCollection) => {
                currentData = nextData;
                navigateForward();
              },
              (err: unknown) => {
                const errorMessage = extractErrorMessage(err, defaultErrorMessageRef.current);
                setError(errorMessage);
                console.error('Freesound API Error:', err);
                setLoading(false);
              }
            );
          } else {
            setSounds(currentData);
            setSearchResults(cacheKey, targetPage, currentData);
            setCurrentPage(targetPage);
            setLoading(false);
          }
        };

        navigateForward();
      } else {
        setSounds(data);
        setSearchResults(cacheKey, targetPage, data);
        setCurrentPage(targetPage);
        setLoading(false);
      }
    },
    [cacheKey, setSearchResults]
  );

  useEffect(() => {
    if (previousCacheKeyRef.current === cacheKey && previousPageRef.current === page) {
      return;
    }
    previousCacheKeyRef.current = cacheKey;
    previousPageRef.current = page;
    
    setCurrentPage(page);
    setError(null);
    setLoading(true);

    const cachedResults = getSearchResults(cacheKey, page);
    if (cachedResults) {
      setSounds(cachedResults);
      setLoading(false);
      return;
    }

    searchFnRef.current(
      (data: SoundCollection) => {
        navigateToPage(data, page);
      },
      (err: unknown) => {
        const errorMessage = extractErrorMessage(err, defaultErrorMessageRef.current);
        setError(errorMessage);
        console.error('Freesound API Error:', err);
        setLoading(false);
      }
    );
  }, [cacheKey, page, getSearchResults, navigateToPage]);

  return {
    sounds,
    loading,
    error,
    currentPage,
  };
}

