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
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative">
      {/* Favorite Button */}
      <div className="absolute top-4 right-4">
        <FavoriteButton
          soundId={sound.id}
          isFavorite={isFavorite}
          onToggle={onToggleFavorite}
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
  );
}

