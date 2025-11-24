import { useEffect, useMemo, useRef, useReducer } from 'react';
import { useParams, Link } from 'react-router-dom';
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

type SoundDetailState = {
  sound: SoundObject | null;
  loading: boolean;
  error: string | null;
};

type SoundDetailAction =
  | { type: 'SET_CACHED_SOUND'; payload: SoundObject }
  | { type: 'SET_API_SOUND'; payload: SoundObject }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET' };

function soundDetailReducer(state: SoundDetailState, action: SoundDetailAction): SoundDetailState {
  switch (action.type) {
    case 'SET_CACHED_SOUND':
      return { sound: action.payload, loading: false, error: null };
    case 'SET_API_SOUND':
      return { sound: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'RESET':
      return { sound: null, loading: true, error: null };
    default:
      return state;
  }
}

export function SoundDetail() {
  const { soundId } = useParams<{ soundId: string }>();
  const { getSound, setSound: cacheSound } = useSoundCache();
  const { toggleFavorite, isFavorite } = useFavorites();
  const cancelledRef = useRef(false);
  const previousSoundIdRef = useRef<string | undefined>(soundId);
  
  // Initialize state from cache using lazy initializer
  const [state, dispatch] = useReducer(soundDetailReducer, null, () => {
    if (!soundId) {
      return { sound: null, loading: false, error: 'Invalid sound ID' };
    }
    const id = parseInt(soundId);
    if (isNaN(id)) {
      return { sound: null, loading: false, error: 'Invalid sound ID' };
    }
    const cached = getSound(id);
    return { sound: cached || null, loading: !cached, error: null };
  });

  // Update document title
  useDocumentTitle(state.sound?.name || (state.loading ? 'Loading...' : 'Sound Details'));

  // Sanitize HTML description
  const sanitizedDescription = useMemo(() => {
    if (!state.sound?.description) return '';
    return DOMPurify.sanitize(state.sound.description, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
  }, [state.sound]);

  useEffect(() => {
    // Skip if soundId hasn't changed
    if (previousSoundIdRef.current === soundId) {
      return;
    }
    previousSoundIdRef.current = soundId;
    
    if (!soundId) {
      // Invalid sound ID - state already initialized correctly
      return;
    }

    const id = parseInt(soundId);
    if (isNaN(id)) {
      // Invalid sound ID - state already initialized correctly
      return;
    }
    
    cancelledRef.current = false;
    
    // Check cache first
    const cached = getSound(id);
    if (cached) {
      // Update state with cached sound using reducer
      dispatch({ type: 'SET_CACHED_SOUND', payload: cached });
      return;
    }
    
    // Not in cache, need to load from API
    dispatch({ type: 'RESET' });

    // Not in cache, load from API
    freesound.getSound(
      id,
      (data: SoundObject) => {
        if (!cancelledRef.current) {
          dispatch({ type: 'SET_API_SOUND', payload: data });
          cacheSound(data); // Store in cache
        }
      },
      (err: unknown) => {
        if (cancelledRef.current) return;
        const errorMessage = extractErrorMessage(err, 'Failed to load sound details.');
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        console.error('Freesound API Error:', err);
      }
    );

    return () => {
      cancelledRef.current = true;
    };
  }, [soundId, getSound, cacheSound]);

  return (
    <ScreenLayout
      loading={state.loading}
      error={state.error}
      hasData={!!state.sound}
      emptyMessage="Sound not found"
    >
      {state.sound && (
        <div className="w-full max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Sound Title with Favorite Button */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{state.sound.name}</h1>
                <p className="text-gray-600">
                  by{' '}
                  <Link
                    to={`/user/${state.sound.username}`}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    {state.sound.username}
                  </Link>
                </p>
              </div>
              {/* Favorite Button */}
              <FavoriteButton
                soundId={state.sound.id}
                isFavorite={isFavorite(state.sound.id)}
                onToggle={toggleFavorite}
                size="lg"
                className="ml-4"
              />
            </div>

            {/* Waveform and Audio Player */}
            {state.sound.previews?.['preview-hq-mp3'] && (
              <div className="mb-6">
                <AudioPlayer
                  src={state.sound.previews['preview-hq-mp3']}
                  waveformUrl={state.sound.images?.waveform_m || state.sound.images?.waveform_l}
                  soundName={state.sound.name}
                  username={state.sound.username}
                  soundId={state.sound.id}
                  waveformMaxHeight={100}
                />
              </div>
            )}

            {/* Sound Details */}
            <SoundMetadata sound={state.sound} />

          {/* Description */}
          {state.sound.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Description</h2>
              <div
                className="text-gray-700 prose prose-sm max-w-none [&_a]:text-blue-600 [&_a:hover]:text-blue-800 [&_a:hover]:underline"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            </div>
          )}

            {/* Tags */}
            {state.sound.tags && state.sound.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Tags</h2>
                <Tags tags={state.sound.tags} variant="rounded" className="gap-2" />
              </div>
            )}

            {/* External Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <a
                href={`https://freesound.org/s/${state.sound.id}/`}
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

