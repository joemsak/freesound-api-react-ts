import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { freesound, type SoundCollection, type SoundObject } from '../services/freesound';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSoundCache } from '../contexts/SoundCacheContext';
import { SearchInput } from '../components/SearchInput';
import { SoundCard } from '../components/SoundCard';
import { AudioPlayer } from '../components/AudioPlayer';
import { FavoriteButton } from '../components/FavoriteButton';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useFavorites } from '../contexts/FavoritesContext';
import { DEFAULT_SOUND_FIELDS } from '../constants';
import { Link } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { getSearchResults, setSearchResults, setSound } = useSoundCache();
  const [query, setQuery] = useState('');
  const [newSounds, setNewSounds] = useState<SoundCollection | null>(null);
  const [randomSound, setRandomSound] = useState<SoundObject | null>(null);
  const [loadingNewSounds, setLoadingNewSounds] = useState(true);
  const [loadingRandomSound, setLoadingRandomSound] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useDocumentTitle('Freesound - Discover Sounds');

  // Load new sounds - with caching
  useEffect(() => {
    const cacheKey = 'home:new_sounds';
    const page = 1;
    
    // Check cache first
    const cachedResults = getSearchResults(cacheKey, page);
    if (cachedResults) {
      // Use requestAnimationFrame to defer setState
      requestAnimationFrame(() => {
        setNewSounds(cachedResults);
        setLoadingNewSounds(false);
      });
      return;
    }

    let cancelled = false;
    
    freesound.textSearch(
      '',
      {
        sort: 'created_desc',
        page_size: 6,
        fields: DEFAULT_SOUND_FIELDS,
      },
      (data: SoundCollection) => {
        if (!cancelled) {
          setNewSounds(data);
          setSearchResults(cacheKey, page, data); // Cache the search results
          setLoadingNewSounds(false);
          // Cache individual sounds
          data.results.forEach((sound) => {
            setSound(sound as SoundObject);
          });
        }
      },
      (err: unknown) => {
        if (!cancelled) {
          console.error('Failed to load new sounds:', err);
          setLoadingNewSounds(false);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [getSearchResults, setSearchResults, setSound]);

  // Load random sound - with caching
  useEffect(() => {
    const cacheKey = 'home:random_sound';
    const page = 1;
    
    // Check cache first
    const cachedResults = getSearchResults(cacheKey, page);
    if (cachedResults && cachedResults.results.length > 0) {
      const sound = cachedResults.results[0] as SoundObject;
      // Use requestAnimationFrame to defer setState
      requestAnimationFrame(() => {
        setRandomSound(sound);
        setLoadingRandomSound(false);
      });
      return;
    }

    let cancelled = false;
    
    freesound.textSearch(
      '',
      {
        sort: 'random',
        page_size: 1,
        fields: DEFAULT_SOUND_FIELDS,
      },
      (data: SoundCollection) => {
        if (!cancelled) {
          if (data.results.length > 0) {
            const sound = data.results[0] as SoundObject;
            setRandomSound(sound);
            setSound(sound);
            setSearchResults(cacheKey, page, data); // Cache the search results
          }
          setLoadingRandomSound(false);
        }
      },
      (err: unknown) => {
        if (!cancelled) {
          console.error('Failed to load random sound:', err);
          setLoadingRandomSound(false);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [getSearchResults, setSearchResults, setSound]);

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
          <LoadingSpinner message="Loading random sound..." />
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
          <LoadingSpinner message="Loading new sounds..." />
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

