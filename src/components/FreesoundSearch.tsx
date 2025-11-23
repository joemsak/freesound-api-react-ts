import { useState } from 'react';
import { Link } from 'react-router-dom';
import { freesound, type SoundCollection, type SoundData } from '../services/freesound';
import { useFavorites } from '../contexts/FavoritesContext';
import { AudioPlayer } from './AudioPlayer';
import { FavoriteButton } from './FavoriteButton';
import { Tags } from './Tags';

export function FreesoundSearch() {
  const [query, setQuery] = useState('');
  const [sounds, setSounds] = useState<SoundCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleSearch = () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);

    freesound.textSearch(
      query,
      {
        page_size: 10,
        fields: 'id,name,previews,images,username,tags,duration',
      },
      (data: SoundCollection) => {
        setSounds(data);
        setLoading(false);
      },
      (err: unknown) => {
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
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Freesound Search</h2>

        {/* Search Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for sounds..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Results */}
        {sounds && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Found {sounds.count} sounds
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sounds.results.map((sound: SoundData) => (
                <div
                  key={sound.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
                >
                  {/* Favorite Button */}
                  <div className="absolute top-4 right-4">
                    <FavoriteButton
                      soundId={sound.id}
                      isFavorite={isFavorite(sound.id)}
                      onToggle={toggleFavorite}
                      size="md"
                    />
                  </div>
                  <Link
                    to={`/sound/${sound.id}`}
                    className="block mb-2 hover:text-blue-600 transition-colors pr-8 cursor-pointer"
                  >
                    <h3 className="font-semibold text-lg mb-1">{sound.name}</h3>
                    <p className="text-sm text-gray-600">
                      by {sound.username}
                    </p>
                  </Link>
                  <Tags tags={sound.tags || []} maxTags={5} className="mb-3" />
                  {sound.previews?.['preview-hq-mp3'] && (
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      <AudioPlayer
                        src={sound.previews['preview-hq-mp3']}
                        waveformUrl={sound.images?.waveform_m || sound.images?.waveform_l}
                        soundName={sound.name}
                        waveformMaxHeight={60}
                      />
                    </div>
                  )}
                  {sound.duration && (
                    <p className="text-xs text-gray-500 mt-2">
                      Duration: {sound.duration.toFixed(2)}s
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {(sounds.next || sounds.previous) && (
              <div className="mt-6 flex justify-center gap-4">
                {sounds.previous && (
                  <button
                    onClick={() => {
                      setLoading(true);
                      sounds.previousPage(
                        (data: SoundCollection) => {
                          setSounds(data);
                          setLoading(false);
                        },
                        (err: unknown) => {
                          setError('Failed to load previous page');
                          console.error('Pagination error:', err);
                          setLoading(false);
                        }
                      );
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                )}
                {sounds.next && (
                  <button
                    onClick={() => {
                      setLoading(true);
                      sounds.nextPage(
                        (data: SoundCollection) => {
                          setSounds(data);
                          setLoading(false);
                        },
                        (err: unknown) => {
                          setError('Failed to load next page');
                          console.error('Pagination error:', err);
                          setLoading(false);
                        }
                      );
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                )}
              </div>
            )}
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

