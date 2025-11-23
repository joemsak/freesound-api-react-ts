import { type SoundData } from '../services/freesound';
import { AudioPlayer } from './AudioPlayer';
import { FavoriteButton } from './FavoriteButton';
import { Tags } from './Tags';
import { SoundTitle } from './SoundTitle';

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
        <div className="mb-2 pr-8">
          <SoundTitle
            soundId={sound.id}
            soundName={sound.name}
            username={sound.username}
          />
        </div>
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

