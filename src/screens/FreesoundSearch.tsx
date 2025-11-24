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

  // Update document title based on search query
  useDocumentTitle(urlQuery ? `Search: ${urlQuery}` : 'Search Results');

  const performSearch = useCallback((searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    // Check cache first
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
      setSearchResults(searchQuery, page, data); // Cache the results
      setLoading(false);
      lastSearchRef.current = { query: searchQuery, page };
    };

    const errorCallback = (err: unknown) => {
      const errorMessage = extractErrorMessage(err, 'Failed to search sounds. Please try again.');
      setError(errorMessage);
      console.error('Freesound API Error:', err);
      setLoading(false);
    };

    // Freesound API uses next/previous URLs for pagination, not direct page numbers
    // Always start from page 1, then navigate if needed
    freesound.textSearch(
      searchQuery,
      {
        page_size: PAGE_SIZE,
        fields: DEFAULT_SOUND_FIELDS,
      },
      (data: SoundCollection) => {
        // If we need a page > 1, navigate forward using nextPage
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
              setSearchResults(searchQuery, page, currentData); // Cache the results
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
    
    // Update URL with new query and reset to page 1
    setSearchParams({ q: trimmedQuery, page: '1' });
    // The useEffect will handle the search when URL changes
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

    // Sync query input with URL
    if (!initializedRef.current) {
      initializedRef.current = true;
      setQuery(urlQuery);
    } else if (query !== urlQuery) {
      setQuery(urlQuery);
    }

    // Check if this is the same search we just did
    const lastSearch = lastSearchRef.current;
    const isSameSearch = lastSearch && lastSearch.query === urlQuery && lastSearch.page === urlPage;
    
    if (isSameSearch) {
      // Already performed this exact search, skip to avoid duplicate API calls
      return;
    }

    // Check if query or page changed - show loading immediately for instant feedback
    const queryChanged = !lastSearch || lastSearch.query !== urlQuery;
    const pageChanged = !lastSearch || lastSearch.page !== urlPage;
    
    if (queryChanged || pageChanged) {
      // Show loading state immediately for instant feedback
      setLoading(true);
      setError(null);
      
      if (queryChanged) {
        // New query - reset ref and always do fresh search
        lastSearchRef.current = null;
        setCurrentPage(urlPage);
        performSearch(urlQuery, urlPage);
        return;
      }
    }

    // Same query, different page - check if we can navigate from current page
    const pageDiff = urlPage - currentPage;
    const canNavigateFromCurrent = sounds && 
                                   Math.abs(pageDiff) <= MAX_NAVIGATION_DISTANCE && 
                                   pageDiff !== 0;

    if (canNavigateFromCurrent && sounds) {
      // Navigate using nextPage/previousPage for small page differences
      setLoading(true);
      setCurrentPage(urlPage);
      
      let currentData = sounds;
      let currentPageNum = currentPage;
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
              // Fallback to fresh search on error
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
              // Fallback to fresh search on error
              lastSearchRef.current = null;
              performSearch(urlQuery, urlPage);
            }
          );
        } else {
          // Can't navigate, do fresh search
          lastSearchRef.current = null;
          performSearch(urlQuery, urlPage);
        }
      };

      navigate();
    } else {
      // Large page jump or no sounds - do fresh search
      setCurrentPage(urlPage);
      performSearch(urlQuery, urlPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery, urlPage, performSearch]);

  const navigateToPage = (page: number) => {
    if (loading || page === currentPage || page < 1) return;

    const totalPages = sounds ? Math.ceil(sounds.count / PAGE_SIZE) : 1;
    if (page > totalPages) return;

    // Update URL - the useEffect will handle the search
    setSearchParams({ q: urlQuery, page: page.toString() });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Search Input - only show if no query */}
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

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Loading Skeleton */}
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

        {/* Results */}
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

        {/* Empty State */}
        {!sounds && !loading && !error && (
          <EmptyState message="Enter a search query to find sounds on Freesound" />
        )}
      </div>
    </div>
  );
}

