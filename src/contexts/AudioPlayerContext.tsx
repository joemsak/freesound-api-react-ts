import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

interface CurrentTrack {
  src: string;
  name: string;
  username?: string;
  waveformUrl?: string;
  audioElement: HTMLAudioElement;
}

interface AudioPlayerContextType {
  registerAudio: (audioElement: HTMLAudioElement, trackInfo: Omit<CurrentTrack, 'audioElement'>) => () => void;
  isPlaying: (audioElement: HTMLAudioElement) => boolean;
  currentTrack: CurrentTrack | null;
  pauseCurrent: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackInfoRef = useRef<Omit<CurrentTrack, 'audioElement'> | null>(null);

  const registerAudio = useCallback((audioElement: HTMLAudioElement, trackInfo: Omit<CurrentTrack, 'audioElement'>) => {
    // If there's a currently playing audio and it's different from this one, pause it
    if (audioRef.current && audioRef.current !== audioElement && !audioRef.current.paused) {
      audioRef.current.pause();
    }

    // Set this as the current audio
    audioRef.current = audioElement;
    trackInfoRef.current = trackInfo;
    setCurrentTrack({
      ...trackInfo,
      audioElement,
    });

    // Return cleanup function
    return () => {
      if (audioRef.current === audioElement) {
        audioRef.current = null;
        trackInfoRef.current = null;
        setCurrentTrack(null);
      }
    };
  }, []);

  const isPlaying = useCallback((audioElement: HTMLAudioElement): boolean => {
    return audioRef.current === audioElement && !audioElement.paused;
  }, []);

  const pauseCurrent = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        registerAudio,
        isPlaying,
        currentTrack,
        pauseCurrent,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}

