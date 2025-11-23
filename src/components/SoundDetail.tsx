import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { freesound, type SoundObject } from '../services/freesound';

export function SoundDetail() {
  const { soundId } = useParams<{ soundId: string }>();
  const [sound, setSound] = useState<SoundObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!soundId) {
      setError('Invalid sound ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    freesound.getSound(
      parseInt(soundId),
      (data: SoundObject) => {
        setSound(data);
        setLoading(false);
      },
      (err: unknown) => {
        let errorMessage = 'Failed to load sound details.';
        if (err instanceof XMLHttpRequest) {
          try {
            const response = JSON.parse(err.responseText || '{}');
            if (response.detail) {
              errorMessage = `Error: ${response.detail}`;
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
  }, [soundId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600">Loading sound details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
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
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <span className="mr-2">←</span> Back to Search
        </Link>

        {/* Sound Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{sound.name}</h1>
        <p className="text-gray-600 mb-6">
          by{' '}
          <a
            href={`https://freesound.org/people/${sound.username}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {sound.username}
          </a>
        </p>

        {/* Waveform and Audio Player */}
        {sound.previews?.['preview-hq-mp3'] && (
          <div className="mb-6">
            {/* Waveform Image */}
            {(sound.images?.waveform_m || sound.images?.waveform_l) && (
              <div className="mb-3 rounded overflow-hidden bg-white border border-gray-300">
                <img
                  src={sound.images?.waveform_m || sound.images?.waveform_l}
                  alt={`Waveform for ${sound.name}`}
                  className="w-full h-auto"
                  style={{
                    display: 'block',
                    maxHeight: '100px',
                    objectFit: 'contain',
                    backgroundColor: '#f9fafb',
                  }}
                />
              </div>
            )}
            {/* Audio Player */}
            <audio controls className="w-full" src={sound.previews['preview-hq-mp3']}>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Sound Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {sound.duration && (
            <div>
              <span className="font-semibold text-gray-700">Duration:</span>{' '}
              <span className="text-gray-600">{sound.duration.toFixed(2)}s</span>
            </div>
          )}
          {sound.filesize && (
            <div>
              <span className="font-semibold text-gray-700">File Size:</span>{' '}
              <span className="text-gray-600">
                {(sound.filesize / 1024).toFixed(2)} KB
              </span>
            </div>
          )}
          {sound.samplerate && (
            <div>
              <span className="font-semibold text-gray-700">Sample Rate:</span>{' '}
              <span className="text-gray-600">{sound.samplerate} Hz</span>
            </div>
          )}
          {sound.bitrate && (
            <div>
              <span className="font-semibold text-gray-700">Bitrate:</span>{' '}
              <span className="text-gray-600">{sound.bitrate} kbps</span>
            </div>
          )}
          {sound.channels && (
            <div>
              <span className="font-semibold text-gray-700">Channels:</span>{' '}
              <span className="text-gray-600">
                {sound.channels === 1 ? 'Mono' : 'Stereo'}
              </span>
            </div>
          )}
          {sound.license && (
            <div>
              <span className="font-semibold text-gray-700">License:</span>{' '}
              <span className="text-gray-600">{sound.license}</span>
            </div>
          )}
        </div>

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
            <div className="flex flex-wrap gap-2">
              {sound.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* External Link */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <a
            href={`https://freesound.org/s/${sound.id}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
          >
            View on Freesound.org
            <span className="ml-2">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

