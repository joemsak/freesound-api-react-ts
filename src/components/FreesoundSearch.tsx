import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { freesound, type SoundCollection } from '../services/freesound';
import { useFavorites } from '../contexts/FavoritesContext';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import { SearchResultsHeader } from './SearchResultsHeader';
import { Pagination } from './Pagination';

export function FreesoundSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const initializedRef = useRef(false);
  
  const [query, setQuery] = useState(urlQuery);
  const [sounds, setSounds] = useState<SoundCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(urlPage);
  const { toggleFavorite, isFavorite } = useFavorites();

  const performSearch = (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentPage(page);

    const searchCallback = (data: SoundCollection) => {
      setSounds(data);
      setLoading(false);
    };

    const errorCallback = (err: unknown) => {
      let errorMessage = 'Failed to search sounds. Please try again.';
      if (err instanceof XMLHttpRequest) {
        if (err.status === 401) {
          errorMessage = 'Authentication failed. The API requires a valid OAuth2 token. Please check your credentials or authenticate via OAuth2.';
        } else if (err.status === 400) {
          errorMessage = 'Invalid request. Please check your API credentials.';
        }
        try {
          const response = JSON.parse(err.responseText || '{}');
          if (response.detail) {
            errorMessage = `API Error: ${response.detail}`;
          }
        } catch {
          // Ignore parse errors
        }
      }
      setError(errorMessage);
      console.error('Freesound API Error:', err);
      setLoading(false);
    };

    // Always do a fresh search - pagination will be handled via URL changes
    // The Freesound API handles pagination internally via next/previous URLs
    freesound.textSearch(
      searchQuery,
      {
        page_size: 10,
        fields: 'id,name,previews,images,username,tags,duration',
      },
      (data: SoundCollection) => {
        // If we're on a page > 1, navigate forward using nextPage
        if (page > 1 && data.next) {
          let currentData = data;
          let currentPageNum = 1;
          
          const navigateForward = () => {
            if (currentPageNum < page && currentData.next) {
              currentPageNum++;
              setLoading(true);
              currentData.nextPage(
                (nextData: SoundCollection) => {
                  currentData = nextData;
                  navigateForward();
                },
                errorCallback
              );
            } else {
              setSounds(currentData);
              setCurrentPage(page);
              setLoading(false);
            }
          };
          
          navigateForward();
        } else {
          searchCallback(data);
        }
      },
      errorCallback
    );
  };

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
    if (urlQuery) {
      if (!initializedRef.current) {
        initializedRef.current = true;
        setQuery(urlQuery);
      }
      // Sync query input with URL if it changed
      if (query !== urlQuery) {
        setQuery(urlQuery);
      }
      // Update current page from URL
      setCurrentPage(urlPage);
      // Perform search
      performSearch(urlQuery, urlPage);
    }
    // We intentionally don't include 'query' to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery, urlPage]);

  const navigateToPage = (page: number) => {
    if (loading || page === currentPage || page < 1) return;

    const totalPages = sounds ? Math.ceil(sounds.count / 10) : 1;
    if (page > totalPages) return;

    setSearchParams({ q: urlQuery, page: page.toString() });
    setLoading(true);

    const pageDiff = page - currentPage;
    if (pageDiff === 0) {
      setLoading(false);
      return;
    }

    if (!sounds) {
      setLoading(false);
      return;
    }

    let currentData = sounds;
    let currentPageNum = currentPage;

    const navigate = () => {
      if (currentPageNum === page) {
        setSounds(currentData);
        setCurrentPage(page);
        setLoading(false);
        return;
      }

      if (pageDiff > 0 && currentData.next) {
        currentPageNum++;
        currentData.nextPage(
          (data: SoundCollection) => {
            currentData = data;
            navigate();
          },
          (err: unknown) => {
            setError('Failed to load page');
            console.error('Pagination error:', err);
            setLoading(false);
          }
        );
      } else if (pageDiff < 0 && currentData.previous) {
        currentPageNum--;
        currentData.previousPage(
          (data: SoundCollection) => {
            currentData = data;
            navigate();
          },
          (err: unknown) => {
            setError('Failed to load page');
            console.error('Pagination error:', err);
            setLoading(false);
          }
        );
      } else {
        setLoading(false);
      }
    };

    navigate();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Freesound Search</h2>

        {/* Search Input */}
        <SearchInput
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Results */}
        {sounds && (
          <div>
            <SearchResultsHeader
              count={sounds.count}
              currentPage={currentPage}
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
          <div className="text-center py-12 text-gray-500">
            <p>Enter a search query to find sounds on Freesound</p>
          </div>
        )}
      </div>
    </div>
  );
}

