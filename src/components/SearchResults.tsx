import { type SoundCollection, type SoundData } from '../services/freesound';
import { SoundCard } from './SoundCard';

interface SearchResultsProps {
  sounds: SoundCollection;
  isFavorite: (soundId: number) => boolean;
  onToggleFavorite: (soundId: number) => void;
}

export function SearchResults({ sounds, isFavorite, onToggleFavorite }: SearchResultsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
      {sounds.results.map((sound: SoundData) => (
        <SoundCard
          key={sound.id}
          sound={sound}
          isFavorite={isFavorite(sound.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

