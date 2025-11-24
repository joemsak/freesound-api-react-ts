import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { freesound, type SoundObject } from '../services/freesound';
import { useFavorites } from '../contexts/FavoritesContext';
import { useSoundCache } from '../contexts/SoundCacheContext';
import { extractErrorMessage } from '../utils/errorHandler';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { AudioPlayer } from '../components/AudioPlayer';
import { FavoriteButton } from '../components/FavoriteButton';
import { Tags } from '../components/Tags';
import { SoundMetadata } from '../components/SoundMetadata';
import { ScreenLayout } from '../components/ScreenLayout';

export function SoundDetail() {
  const { soundId } = useParams<{ soundId: string }>();
  const location = useLocation();
  const { getSound, setSound: cacheSound } = useSoundCache();
  const { toggleFavorite, isFavorite } = useFavorites();
  const cancelledRef = useRef(false);
  
  // Don't initialize from cache - let useEffect handle it to ensure proper reset on route change
  const [sound, setSound] = useState<SoundObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update document title
  useDocumentTitle(sound?.name || (loading ? 'Loading...' : 'Sound Details'));

  // Sanitize HTML description
  const sanitizedDescription = useMemo(() => {
    if (!sound?.description) return '';
    return DOMPurify.sanitize(sound.description, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
  }, [sound]);

  useEffect(() => {
    if (!soundId) {
      // Reset all state at once - this is necessary for error handling
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSound(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Invalid sound ID');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const id = parseInt(soundId);
    
    // Reset state IMMEDIATELY when soundId changes for instant feedback
    cancelledRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSound(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    
    // Check cache first
    const cached = getSound(id);
    if (cached) {
      // Update state with cached sound immediately
      setSound(cached);
      setLoading(false);
      return;
    }

    // Not in cache, load from API
    freesound.getSound(
      id,
      (data: SoundObject) => {
        if (!cancelledRef.current) {
          setSound(data);
          cacheSound(data); // Store in cache
          setLoading(false);
        }
      },
      (err: unknown) => {
        if (cancelledRef.current) return;
        const errorMessage = extractErrorMessage(err, 'Failed to load sound details.');
        setError(errorMessage);
        console.error('Freesound API Error:', err);
        setLoading(false);
      }
    );

    return () => {
      cancelledRef.current = true;
    };
  }, [soundId, location.key, getSound, cacheSound]);

  return (
    <ScreenLayout
      loading={loading}
      error={error}
      hasData={!!sound}
      emptyMessage="Sound not found"
    >
      {sound && (
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Sound Title with Favorite Button */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{sound.name}</h1>
                <p className="text-gray-600">
                  by{' '}
                  <Link
                    to={`/user/${sound.username}`}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    {sound.username}
                  </Link>
                </p>
              </div>
              {/* Favorite Button */}
              <FavoriteButton
                soundId={sound.id}
                isFavorite={isFavorite(sound.id)}
                onToggle={toggleFavorite}
                size="lg"
                className="ml-4"
              />
            </div>

            {/* Waveform and Audio Player */}
            {sound.previews?.['preview-hq-mp3'] && (
              <div className="mb-6">
                <AudioPlayer
                  src={sound.previews['preview-hq-mp3']}
                  waveformUrl={sound.images?.waveform_m || sound.images?.waveform_l}
                  soundName={sound.name}
                  username={sound.username}
                  soundId={sound.id}
                  waveformMaxHeight={100}
                />
              </div>
            )}

            {/* Sound Details */}
            <SoundMetadata sound={sound} />

          {/* Description */}
          {sound.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
              <div
                className="text-gray-700 prose prose-sm max-w-none [&_a]:text-blue-600 [&_a:hover]:text-blue-800 [&_a:hover]:underline"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            </div>
          )}

            {/* Tags */}
            {sound.tags && sound.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Tags</h2>
                <Tags tags={sound.tags} variant="rounded" className="gap-2" />
              </div>
            )}

            {/* External Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <a
                href={`https://freesound.org/s/${sound.id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                View on Freesound.org
                <span className="ml-2">→</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </ScreenLayout>
  );
}

