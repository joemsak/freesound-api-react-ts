import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { freesound, type SoundObject } from '../services/freesound';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useCachedSearch } from '../hooks/useCachedSearch';
import { SearchInput } from '../components/SearchInput';
import { SoundCard } from '../components/SoundCard';
import { SoundCardSkeleton } from '../components/SoundCardSkeleton';
import { AudioPlayer } from '../components/AudioPlayer';
import { FavoriteButton } from '../components/FavoriteButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { useFavorites } from '../contexts/FavoritesContext';
import { DEFAULT_SOUND_FIELDS } from '../constants';

export function Home() {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useDocumentTitle('Freesound - Discover Sounds');

  // Load new sounds - with caching
  const { data: newSounds, loading: loadingNewSounds } = useCachedSearch({
    cacheKey: 'home:new_sounds',
    page: 1,
    searchFn: (success, errorCallback) => {
      freesound.textSearch(
        '',
        {
          sort: 'created_desc',
          page_size: 6,
          fields: DEFAULT_SOUND_FIELDS,
        },
        success,
        errorCallback
      );
    },
    onError: (err) => {
      console.error('Failed to load new sounds:', err);
    },
  });

  // Load random sound - with caching
  const { data: randomSoundData, loading: loadingRandomSound } = useCachedSearch({
    cacheKey: 'home:random_sound',
    page: 1,
    searchFn: (success, errorCallback) => {
      freesound.textSearch(
        '',
        {
          sort: 'random',
          page_size: 1,
          fields: DEFAULT_SOUND_FIELDS,
        },
        success,
        errorCallback
      );
    },
    onError: (err) => {
      console.error('Failed to load random sound:', err);
    },
  });

  const randomSound = randomSoundData?.results[0] as SoundObject | undefined;

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError('Please enter a search query');
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Search Sounds</h2>
        <SearchInput
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          loading={false}
        />
        {error && <ErrorMessage message={error} className="mt-4" />}
      </div>

      {/* Random Sound of the Day */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sound of the Day</h2>
        {loadingRandomSound ? (
          <div className="border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-7 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            </div>
            <div className="h-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : randomSound ? (
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Link
                  to={`/sound/${randomSound.id}`}
                  className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {randomSound.name}
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  by{' '}
                  <Link
                    to={`/user/${randomSound.username}`}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    {randomSound.username}
                  </Link>
                </p>
              </div>
              <FavoriteButton
                soundId={randomSound.id}
                isFavorite={isFavorite(randomSound.id)}
                onToggle={toggleFavorite}
                size="lg"
              />
            </div>
            {randomSound.previews?.['preview-hq-mp3'] && (
              <AudioPlayer
                src={randomSound.previews['preview-hq-mp3']}
                waveformUrl={randomSound.images?.waveform_m || randomSound.images?.waveform_l}
                soundName={randomSound.name}
                username={randomSound.username}
                soundId={randomSound.id}
                waveformMaxHeight={80}
              />
            )}
          </div>
        ) : (
          <p className="text-gray-600">No random sound available</p>
        )}
      </div>

      {/* New Sounds Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">New Sounds</h2>
          {newSounds && newSounds.count > 0 && (
            <Link
              to="/search?q=*&sort=created_desc"
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold cursor-pointer"
            >
              View All →
            </Link>
          )}
        </div>
        {loadingNewSounds ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {Array.from({ length: 6 }).map((_, index) => (
              <SoundCardSkeleton key={index} />
            ))}
          </div>
        ) : newSounds && newSounds.results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {newSounds.results.map((sound) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                isFavorite={isFavorite(sound.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No new sounds available</p>
        )}
      </div>
    </div>
  );
}

