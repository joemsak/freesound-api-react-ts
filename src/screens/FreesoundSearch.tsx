import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { freesound, type SoundCollection } from '../services/freesound';
import { useFavorites } from '../contexts/FavoritesContext';
import { useSoundCache } from '../contexts/SoundCacheContext';
import { extractErrorMessage } from '../utils/errorHandler';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { PAGE_SIZE, MAX_NAVIGATION_DISTANCE, DEFAULT_SOUND_FIELDS } from '../constants';
import { SearchInput } from '../components/SearchInput';
import { SearchResults } from '../components/SearchResults';
import { SearchResultsHeader } from '../components/SearchResultsHeader';
import { SearchResultsSkeleton } from '../components/SearchResultsSkeleton';
import { Pagination } from '../components/Pagination';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';

export function FreesoundSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const initializedRef = useRef(false);
  const lastSearchRef = useRef<{ query: string; page: number } | null>(null);
  
  const [query, setQuery] = useState(urlQuery);
  const [sounds, setSounds] = useState<SoundCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { getSearchResults, setSearchResults } = useSoundCache();

  const currentPageRef = useRef(currentPage);
  const soundsRef = useRef(sounds);
  const queryRef = useRef(query);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);
  
  useEffect(() => {
    soundsRef.current = sounds;
  }, [sounds]);
  
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  useDocumentTitle(urlQuery ? `Search: ${urlQuery}` : 'Search Results');

  const performSearch = useCallback((searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    const cachedResults = getSearchResults(searchQuery, page);
    if (cachedResults) {
      setSounds(cachedResults);
      setCurrentPage(page);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentPage(page);

    const searchCallback = (data: SoundCollection) => {
      setSounds(data);
      setSearchResults(searchQuery, page, data);
      setLoading(false);
      lastSearchRef.current = { query: searchQuery, page };
    };

    const errorCallback = (err: unknown) => {
      const errorMessage = extractErrorMessage(err, 'Failed to search sounds. Please try again.');
      setError(errorMessage);
      console.error('Freesound API Error:', err);
      setLoading(false);
    };

    freesound.textSearch(
      searchQuery,
      {
        page_size: PAGE_SIZE,
        fields: DEFAULT_SOUND_FIELDS,
      },
      (data: SoundCollection) => {
        if (page > 1 && data.next) {
          let currentData = data;
          let currentPageNum = 1;
          
          const navigateForward = () => {
            if (currentPageNum < page && currentData.next) {
              currentPageNum++;
              currentData.nextPage(
                (nextData: SoundCollection) => {
                  currentData = nextData;
                  navigateForward();
                },
                errorCallback
              );
            } else {
              setSounds(currentData);
              setSearchResults(searchQuery, page, currentData);
              setCurrentPage(page);
              setLoading(false);
              lastSearchRef.current = { query: searchQuery, page };
            }
          };
          
          navigateForward();
        } else {
          searchCallback(data);
        }
      },
      errorCallback
    );
  }, [getSearchResults, setSearchResults]);

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError('Please enter a search query');
      return;
    }

    setSearchParams({ q: trimmedQuery, page: '1' });
  };

  // Initialize from URL on mount and sync when URL changes
  useEffect(() => {
    if (!urlQuery) {
      // Clear results if no query
      setSounds(null);
      setError(null);
      setLoading(false);
      lastSearchRef.current = null;
      return;
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      setQuery(urlQuery);
      queryRef.current = urlQuery;
    } else if (queryRef.current !== urlQuery) {
      setQuery(urlQuery);
      queryRef.current = urlQuery;
    }

    const lastSearch = lastSearchRef.current;
    const isSameSearch = lastSearch && lastSearch.query === urlQuery && lastSearch.page === urlPage;

    if (isSameSearch) {
      return;
    }

    const queryChanged = !lastSearch || lastSearch.query !== urlQuery;
    const pageChanged = !lastSearch || lastSearch.page !== urlPage;

    if (queryChanged || pageChanged) {
      setLoading(true);
      setError(null);

      if (queryChanged) {
        lastSearchRef.current = null;
        setCurrentPage(urlPage);
        performSearch(urlQuery, urlPage);
        return;
      }
    }

    const pageDiff = urlPage - currentPageRef.current;
    const canNavigateFromCurrent = soundsRef.current && 
                                   Math.abs(pageDiff) <= MAX_NAVIGATION_DISTANCE && 
                                   pageDiff !== 0;

    if (canNavigateFromCurrent && soundsRef.current) {
      setLoading(true);
      setCurrentPage(urlPage);
      
      let currentData = soundsRef.current;
      let currentPageNum = currentPageRef.current;
      const direction = pageDiff > 0 ? 'next' : 'previous';

      const navigate = () => {
        if (currentPageNum === urlPage) {
          setSounds(currentData);
          setSearchResults(urlQuery, urlPage, currentData); // Cache the results
          setLoading(false);
          lastSearchRef.current = { query: urlQuery, page: urlPage };
          return;
        }

        if (direction === 'next' && currentData.next) {
          currentPageNum++;
          currentData.nextPage(
            (data: SoundCollection) => {
              currentData = data;
              navigate();
            },
            () => {
              lastSearchRef.current = null;
              performSearch(urlQuery, urlPage);
            }
          );
        } else if (direction === 'previous' && currentData.previous) {
          currentPageNum--;
          currentData.previousPage(
            (data: SoundCollection) => {
              currentData = data;
              navigate();
            },
            () => {
              lastSearchRef.current = null;
              performSearch(urlQuery, urlPage);
            }
          );
        } else {
          lastSearchRef.current = null;
          performSearch(urlQuery, urlPage);
        }
      };

      navigate();
    } else {
      setCurrentPage(urlPage);
      performSearch(urlQuery, urlPage);
    }
  }, [urlQuery, urlPage, performSearch, setSearchResults]);

  const navigateToPage = (page: number) => {
    if (loading || page === currentPage || page < 1) return;

    const totalPages = sounds ? Math.ceil(sounds.count / PAGE_SIZE) : 1;
    if (page > totalPages) return;

    setSearchParams({ q: urlQuery, page: page.toString() });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {!urlQuery && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Search Sounds</h2>
            <SearchInput
              query={query}
              onQueryChange={setQuery}
              onSearch={handleSearch}
              loading={loading}
            />
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        {loading && !sounds && (
          <div>
            {urlQuery && (
              <div className="mb-4">
                <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            )}
            <SearchResultsSkeleton count={PAGE_SIZE} />
          </div>
        )}

        {sounds && !loading && (
          <div>
            <SearchResultsHeader
              count={sounds.count}
              currentPage={currentPage}
              query={urlQuery}
            />
            <SearchResults
              sounds={sounds}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
            <Pagination
              sounds={sounds}
              currentPage={currentPage}
              urlQuery={urlQuery}
              loading={loading}
              onPageChange={navigateToPage}
            />
          </div>
        )}

        {!sounds && !loading && !error && (
          <EmptyState message="Enter a search query to find sounds on Freesound" />
        )}
      </div>
    </div>
  );
}

