import { useParams, useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';
import { freesound, type SoundCollection } from '../services/freesound';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { usePaginatedSearch } from '../hooks/usePaginatedSearch';
import { SearchResults } from '../components/SearchResults';
import { SearchResultsHeader } from '../components/SearchResultsHeader';
import { Pagination } from '../components/Pagination';
import { ScreenLayout } from '../components/ScreenLayout';
import { useFavorites } from '../contexts/FavoritesContext';
import { PAGE_SIZE, DEFAULT_SOUND_FIELDS } from '../constants';

export function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const { toggleFavorite, isFavorite } = useFavorites();

  // Update document title
  useDocumentTitle(username ? `User: ${username}` : 'User Profile');

  const searchFn = useCallback((success: (data: SoundCollection) => void, errorCallback: (err: unknown) => void) => {
    if (!username) {
      errorCallback(new Error('Invalid username'));
      return;
    }
    freesound.textSearch(
      '',
      {
        filter: `username:${username}`,
        page_size: PAGE_SIZE,
        fields: DEFAULT_SOUND_FIELDS,
      },
      success,
      errorCallback
    );
  }, [username]);

  const { sounds, loading, error, currentPage } = usePaginatedSearch({
    cacheKey: username ? `user:${username}` : '',
    searchFn,
    defaultErrorMessage: 'Failed to load user sounds.',
    page: urlPage,
  });

  const navigateToPage = (page: number) => {
    if (loading || page === currentPage || page < 1) return;
    const totalPages = sounds ? Math.ceil(sounds.count / PAGE_SIZE) : 1;
    if (page > totalPages) return;
    setSearchParams({ page: page.toString() });
  };

  if (!username) {
    return (
      <ScreenLayout
        loading={false}
        error="Invalid username"
        hasData={false}
        emptyMessage="Invalid username"
      >
        <></>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      loading={loading}
      error={error}
      hasData={!!sounds && sounds.results.length > 0}
      emptyMessage={`No sounds found for ${username}`}
    >
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* User Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {username}
            </h1>
            <p className="text-gray-600">
              Sounds uploaded by {username}
            </p>
          </div>

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
                urlQuery={username}
                loading={loading}
                onPageChange={navigateToPage}
                isUserProfile={true}
              />
            </div>
          )}
        </div>
      </div>
    </ScreenLayout>
  );
}

