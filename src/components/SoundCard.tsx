import { Link } from 'react-router-dom';
import { type SoundData } from '../services/freesound';
import { AudioPlayer } from './AudioPlayer';
import { FavoriteButton } from './FavoriteButton';
import { Tags } from './Tags';

interface SoundCardProps {
  sound: SoundData;
  isFavorite: boolean;
  onToggleFavorite: (soundId: number) => void;
}

export function SoundCard({ sound, isFavorite, onToggleFavorite }: SoundCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative flex flex-col h-full">
      {/* Favorite Button */}
      <div className="absolute top-4 right-4 z-10">
        <FavoriteButton
          soundId={sound.id}
          isFavorite={isFavorite}
          onToggle={onToggleFavorite}
          size="md"
        />
      </div>
      
      {/* Content Section - grows to fill space */}
      <div className="flex-1 flex flex-col">
        <Link
          to={`/sound/${sound.id}`}
          className="block mb-2 hover:text-blue-600 transition-colors pr-8 cursor-pointer"
          title={sound.name}
        >
          <h3 className="font-semibold text-lg mb-1 truncate" title={sound.name}>
            {sound.name}
          </h3>
          <p className="text-sm text-gray-600 truncate" title={`by ${sound.username}`}>
            by{' '}
            <Link
              to={`/user/${sound.username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:underline cursor-pointer"
              title={sound.username}
            >
              {sound.username}
            </Link>
          </p>
        </Link>
        <Tags tags={sound.tags || []} maxTags={5} className="mb-3" />
        {sound.duration && (
          <p className="text-xs text-gray-500 mb-3">
            Duration: {sound.duration.toFixed(2)}s
          </p>
        )}
      </div>

      {/* Audio Player Section - always at bottom */}
      {sound.previews?.['preview-hq-mp3'] && (
        <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
          <AudioPlayer
            src={sound.previews['preview-hq-mp3']}
            waveformUrl={sound.images?.waveform_m || sound.images?.waveform_l}
            soundName={sound.name}
            username={sound.username}
            soundId={sound.id}
            waveformMaxHeight={60}
          />
        </div>
      )}
    </div>
  );
}

