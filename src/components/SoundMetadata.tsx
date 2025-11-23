import { type SoundObject } from '../services/freesound';

interface SoundMetadataProps {
  sound: SoundObject;
}

export function SoundMetadata({ sound }: SoundMetadataProps) {
  const metadataItems = [
    sound.duration && {
      label: 'Duration',
      value: `${sound.duration.toFixed(2)}s`,
    },
    sound.filesize && {
      label: 'File Size',
      value: `${(sound.filesize / 1024).toFixed(2)} KB`,
    },
    sound.samplerate && {
      label: 'Sample Rate',
      value: `${sound.samplerate} Hz`,
    },
    sound.bitrate && {
      label: 'Bitrate',
      value: `${sound.bitrate} kbps`,
    },
    sound.channels && {
      label: 'Channels',
      value: sound.channels === 1 ? 'Mono' : 'Stereo',
    },
    sound.license && {
      label: 'License',
      value: sound.license,
    },
  ].filter((item): item is { label: string; value: string } => item !== false);

  if (metadataItems.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {metadataItems.map((item) => (
        <div key={item.label}>
          <span className="font-semibold text-gray-700">{item.label}:</span>{' '}
          <span className="text-gray-600">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

