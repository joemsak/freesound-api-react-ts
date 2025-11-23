interface AudioPlayerProps {
  src: string;
  waveformUrl?: string;
  soundName?: string;
  className?: string;
  waveformMaxHeight?: number;
  onClick?: (e: React.MouseEvent) => void;
  showWaveform?: boolean;
}

export function AudioPlayer({
  src,
  waveformUrl,
  soundName,
  className = 'w-full',
  waveformMaxHeight = 60,
  onClick,
  showWaveform = true,
}: AudioPlayerProps) {
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
      <audio controls className={className} src={src}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

