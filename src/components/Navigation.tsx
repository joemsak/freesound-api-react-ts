import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import { SearchInput } from './SearchInput';

interface NavigationProps {
  onToggleFavorites: () => void;
  favoritesOpen: boolean;
}

export function Navigation({ onToggleFavorites, favoritesOpen }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { favorites } = useFavorites();
  // Check if we're on the home page
  // React Router with basename automatically strips the basename from pathname
  const isHomePage = location.pathname === '/';
  const urlQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(urlQuery);

  // Sync query with URL when on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      // Defer setState to avoid cascading renders
      requestAnimationFrame(() => {
        setQuery(urlQuery);
      });
    } else {
      // Clear query when not on search page
      requestAnimationFrame(() => {
        setQuery('');
      });
    }
  }, [location.pathname, urlQuery]);

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}&page=1`);
      // Don't clear query here - let useEffect sync it
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo/Title */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex-shrink-0"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <span className="text-xl font-bold">Freesound</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl flex items-center">
            <SearchInput
              query={query}
              onQueryChange={setQuery}
              onSearch={handleSearch}
              loading={false}
            />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Home Link */}
            {!isHomePage && (
              <Link
                to="/"
                className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                Home
              </Link>
            )}

            {/* Favorites Toggle Button */}
            <button
              onClick={onToggleFavorites}
              className="relative px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              title={favoritesOpen ? 'Hide favorites' : 'Show favorites'}
            >
              <svg
                className="w-5 h-5"
                fill={favorites.length > 0 ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span className="text-sm font-medium hidden sm:inline">Favorites</span>
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

