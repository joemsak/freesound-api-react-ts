import { useState, useEffect, useCallback } from 'react';
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
  const [sounds, setSounds] = useState<SoundCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(page);

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
                const errorMessage = extractErrorMessage(err, defaultErrorMessage);
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
    [cacheKey, defaultErrorMessage, setSearchResults]
  );

  useEffect(() => {
    setCurrentPage(page);

    // Check cache first
    const cachedResults = getSearchResults(cacheKey, page);
    if (cachedResults) {
      setSounds(cachedResults);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    searchFn(
      (data: SoundCollection) => {
        navigateToPage(data, page);
      },
      (err: unknown) => {
        const errorMessage = extractErrorMessage(err, defaultErrorMessage);
        setError(errorMessage);
        console.error('Freesound API Error:', err);
        setLoading(false);
      }
    );
  }, [cacheKey, page, getSearchResults, searchFn, navigateToPage, defaultErrorMessage]);

  return {
    sounds,
    loading,
    error,
    currentPage,
  };
}

