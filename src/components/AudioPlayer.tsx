import { useEffect, useRef } from 'react';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';

interface AudioPlayerProps {
  src: string;
  waveformUrl?: string;
  soundName?: string;
  username?: string;
  soundId?: number;
  className?: string;
  waveformMaxHeight?: number;
  onClick?: (e: React.MouseEvent) => void;
  showWaveform?: boolean;
}

export function AudioPlayer({
  src,
  waveformUrl,
  soundName = 'Unknown',
  username,
  soundId,
  className = 'w-full',
  waveformMaxHeight = 60,
  onClick,
  showWaveform = true,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { registerAudio } = useAudioPlayer();

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    // Register this audio element with track info
    const unregister = registerAudio(audioElement, {
      src,
      name: soundName,
      username,
      waveformUrl,
      soundId,
    });

    // Handle play event to ensure only one audio plays at a time
    const handlePlay = () => {
      registerAudio(audioElement, {
        src,
        name: soundName,
        username,
        waveformUrl,
        soundId,
      });
    };

    audioElement.addEventListener('play', handlePlay);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      unregister();
    };
  }, [registerAudio, src, soundName, username, waveformUrl, soundId]);

  return (
    <div onClick={onClick}>
      {/* Waveform Image */}
      {showWaveform && waveformUrl && (
        <div className="mb-2 rounded overflow-hidden bg-white border border-gray-300">
          <img
            src={waveformUrl}
            alt={soundName ? `Waveform for ${soundName}` : 'Waveform'}
            className="w-full h-auto"
            style={{
              display: 'block',
              maxHeight: `${waveformMaxHeight}px`,
              objectFit: 'contain',
              backgroundColor: '#f9fafb',
            }}
            onError={(e) => {
              // Hide waveform if image fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      {/* Audio Player */}
      <audio ref={audioRef} controls className={className} src={src}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

