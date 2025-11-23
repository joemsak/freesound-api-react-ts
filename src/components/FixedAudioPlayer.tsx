import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { FavoriteButton } from './FavoriteButton';

export function FixedAudioPlayer() {
  const { currentTrack, pauseCurrent } = useAudioPlayer();
  const { toggleFavorite, isFavorite } = useFavorites();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync the fixed player audio element with the current track's audio element
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;

    const fixedAudio = audioRef.current;
    const sourceAudio = currentTrack.audioElement;

    // Sync playback state
    const syncPlayback = () => {
      if (sourceAudio.paused) {
        fixedAudio.pause();
      } else {
        fixedAudio.play().catch(() => {
          // Ignore play errors (user interaction required)
        });
      }
    };

    // Sync time
    const syncTime = () => {
      if (Math.abs(fixedAudio.currentTime - sourceAudio.currentTime) > 0.5) {
        fixedAudio.currentTime = sourceAudio.currentTime;
      }
    };

    // Listen to source audio events
    sourceAudio.addEventListener('play', syncPlayback);
    sourceAudio.addEventListener('pause', syncPlayback);
    sourceAudio.addEventListener('timeupdate', syncTime);

    // Initial sync
    syncPlayback();
    syncTime();

    // Handle fixed player interactions
    const handleFixedPlay = () => {
      if (sourceAudio.paused) {
        sourceAudio.play();
      }
    };

    const handleFixedPause = () => {
      if (!sourceAudio.paused) {
        sourceAudio.pause();
      }
    };

    const handleFixedSeek = () => {
      sourceAudio.currentTime = fixedAudio.currentTime;
    };

    fixedAudio.addEventListener('play', handleFixedPlay);
    fixedAudio.addEventListener('pause', handleFixedPause);
    fixedAudio.addEventListener('seeked', handleFixedSeek);

    return () => {
      sourceAudio.removeEventListener('play', syncPlayback);
      sourceAudio.removeEventListener('pause', syncPlayback);
      sourceAudio.removeEventListener('timeupdate', syncTime);
      fixedAudio.removeEventListener('play', handleFixedPlay);
      fixedAudio.removeEventListener('pause', handleFixedPause);
      fixedAudio.removeEventListener('seeked', handleFixedSeek);
    };
  }, [currentTrack]);

  if (!currentTrack) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {currentTrack.waveformUrl && (
                <div className="hidden sm:block w-16 h-12 rounded overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                  <img
                    src={currentTrack.waveformUrl}
                    alt={`Waveform for ${currentTrack.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-gray-800 truncate">
                  {currentTrack.name}
                </p>
                {currentTrack.username && (
                  <p className="text-xs text-gray-600 truncate">
                    by{' '}
                    <Link
                      to={`/user/${currentTrack.username}`}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      {currentTrack.username}
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center gap-2">
            {currentTrack.soundId && (
              <FavoriteButton
                soundId={currentTrack.soundId}
                isFavorite={isFavorite(currentTrack.soundId)}
                onToggle={toggleFavorite}
                size="md"
                className="flex-shrink-0"
              />
            )}
            <button
              onClick={pauseCurrent}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              title="Pause"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </button>
            <div className="w-64 sm:w-96">
              <audio
                ref={audioRef}
                controls
                className="w-full h-8"
                src={currentTrack.src}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

