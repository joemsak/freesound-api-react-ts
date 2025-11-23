import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { freesound, type SoundObject } from '../services/freesound';
import { useFavorites } from '../contexts/FavoritesContext';
import { AudioPlayer } from './AudioPlayer';
import { FavoriteButton } from './FavoriteButton';

interface FavoritesSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function FavoritesSidebar({ isOpen, onToggle }: FavoritesSidebarProps) {
  const { favorites, removeFavorite } = useFavorites();
  const [favoriteSounds, setFavoriteSounds] = useState<SoundObject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (favorites.length === 0) {
      setFavoriteSounds([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;
    const soundsMap = new Map<number, SoundObject>();
    let loaded = 0;
    const currentFavorites = [...favorites];

    const checkComplete = () => {
      if (cancelled) return;
      if (loaded === currentFavorites.length) {
        // Sort sounds to match favorites order
        const sortedSounds = currentFavorites
          .map((id) => soundsMap.get(id))
          .filter((sound): sound is SoundObject => sound !== undefined);
        setFavoriteSounds(sortedSounds);
        setLoading(false);
      }
    };

    currentFavorites.forEach((soundId) => {
      freesound.getSound(
        soundId,
        (data: SoundObject) => {
          if (!cancelled) {
            soundsMap.set(soundId, data);
            loaded++;
            checkComplete();
          }
        },
        () => {
          if (!cancelled) {
            loaded++;
            checkComplete();
          }
        }
      );
    });

    return () => {
      cancelled = true;
    };
  }, [favorites]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden cursor-pointer"
        onClick={onToggle}
      />
      {/* Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 h-screen overflow-y-auto fixed right-0 top-0 p-6 z-50 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Favorites</h2>
          <p className="text-sm text-gray-600">
            {favorites.length} {favorites.length === 1 ? 'sound' : 'sounds'}
          </p>
        </div>
        <button
          onClick={onToggle}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          title="Close sidebar"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {loading && favorites.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Loading favorites...</p>
        </div>
      )}

      {!loading && favorites.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
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
          <p className="text-sm">No favorites yet</p>
          <p className="text-xs mt-1">Star sounds to add them here</p>
        </div>
      )}

      {!loading && favoriteSounds.length > 0 && (
        <div className="space-y-4">
          {favoriteSounds.map((sound) => (
            <div
              key={sound.id}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <Link
                  to={`/sound/${sound.id}`}
                  className="flex-1 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{sound.name}</h3>
                  <p className="text-xs text-gray-600">by {sound.username}</p>
                </Link>
                <FavoriteButton
                  soundId={sound.id}
                  isFavorite={true}
                  onToggle={removeFavorite}
                  size="sm"
                  className="ml-2"
                  showAsFilled={true}
                />
              </div>
              {sound.previews?.['preview-hq-mp3'] && (
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <AudioPlayer
                    src={sound.previews['preview-hq-mp3']}
                    soundName={sound.name}
                    className="w-full"
                    showWaveform={false}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
}

