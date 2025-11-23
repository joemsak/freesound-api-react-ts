import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { freesound, type SoundObject } from '../services/freesound';
import { useFavorites } from '../contexts/FavoritesContext';
import { extractErrorMessage } from '../utils/errorHandler';
import { AudioPlayer } from './AudioPlayer';
import { FavoriteButton } from './FavoriteButton';
import { Tags } from './Tags';
import { SoundMetadata } from './SoundMetadata';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSpinner } from './LoadingSpinner';

export function SoundDetail() {
  const { soundId } = useParams<{ soundId: string }>();
  const [sound, setSound] = useState<SoundObject | null>(null);
  const [loading, setLoading] = useState(() => !!soundId);
  const [error, setError] = useState<string | null>(() => (!soundId ? 'Invalid sound ID' : null));
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    if (!soundId) {
      return;
    }

    let cancelled = false;

    const loadSound = () => {
      freesound.getSound(
        parseInt(soundId),
        (data: SoundObject) => {
          if (!cancelled) {
            setSound(data);
            setLoading(false);
          }
        },
        (err: unknown) => {
          if (cancelled) return;
          const errorMessage = extractErrorMessage(err, 'Failed to load sound details.');
          setError(errorMessage);
          console.error('Freesound API Error:', err);
          setLoading(false);
        }
      );
    };

    loadSound();

    return () => {
      cancelled = true;
    };
  }, [soundId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <LoadingSpinner message="Loading sound details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <ErrorMessage message={error} className="mb-4" />
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Search
          </Link>
        </div>
      </div>
    );
  }

  if (!sound) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">

        {/* Sound Title with Favorite Button */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{sound.name}</h1>
            <p className="text-gray-600">
              by{' '}
              <a
                href={`https://freesound.org/people/${sound.username}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline cursor-pointer"
              >
                {sound.username}
              </a>
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
            <p className="text-gray-700 whitespace-pre-wrap">{sound.description}</p>
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
  );
}

