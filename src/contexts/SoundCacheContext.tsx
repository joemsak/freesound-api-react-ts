import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { SoundObject, SoundCollection } from '../services/freesound';

const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const SOUND_CACHE_KEY = 'freesound_sound_cache';
const SEARCH_CACHE_KEY = 'freesound_search_cache';

interface CachedSound {
  data: SoundObject;
  timestamp: number;
  etag?: string;
  lastModified?: string;
}

interface CachedSearch {
  data: SoundCollection;
  timestamp: number;
  etag?: string;
  lastModified?: string;
}

interface SoundCacheContextType {
  getSound: (soundId: number) => SoundObject | undefined;
  setSound: (sound: SoundObject) => void;
  hasSound: (soundId: number) => boolean;
  getSearchResults: (query: string, page: number) => SoundCollection | undefined;
  setSearchResults: (query: string, page: number, results: SoundCollection) => void;
  clearCache: () => void;
}

const SoundCacheContext = createContext<SoundCacheContextType | undefined>(undefined);

function loadSoundCacheFromStorage(): Map<number, CachedSound> {
  try {
    const stored = localStorage.getItem(SOUND_CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const cache = new Map<number, CachedSound>();
      const now = Date.now();
      
      // Filter out expired entries
      Object.entries(parsed).forEach(([id, cached]: [string, any]) => {
        if (cached.timestamp && cached.data && (now - cached.timestamp) < CACHE_EXPIRY_MS) {
          cache.set(parseInt(id), cached);
        }
      });
      
      // Save back filtered cache
      if (cache.size !== Object.keys(parsed).length) {
        saveSoundCacheToStorage(cache);
      }
      
      return cache;
    }
  } catch {
    // Ignore parse errors
  }
  return new Map();
}

function saveSoundCacheToStorage(cache: Map<number, CachedSound>): void {
  try {
    const obj: Record<string, CachedSound> = {};
    cache.forEach((value, key) => {
      obj[key.toString()] = value;
    });
    localStorage.setItem(SOUND_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

function loadSearchCacheFromStorage(): Map<string, CachedSearch> {
  try {
    const stored = localStorage.getItem(SEARCH_CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const cache = new Map<string, CachedSearch>();
      const now = Date.now();
      
      // Filter out expired entries
      Object.entries(parsed).forEach(([key, cached]: [string, any]) => {
        if (cached.timestamp && cached.data && (now - cached.timestamp) < CACHE_EXPIRY_MS) {
          cache.set(key, cached);
        }
      });
      
      // Save back filtered cache
      if (cache.size !== Object.keys(parsed).length) {
        saveSearchCacheToStorage(cache);
      }
      
      return cache;
    }
  } catch {
    // Ignore parse errors
  }
  return new Map();
}

function saveSearchCacheToStorage(cache: Map<string, CachedSearch>): void {
  try {
    const obj: Record<string, CachedSearch> = {};
    cache.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore storage errors (e.g., quota exceeded)
  }
}

export function SoundCacheProvider({ children }: { children: ReactNode }) {
  const [soundCache, setSoundCache] = useState<Map<number, CachedSound>>(() => loadSoundCacheFromStorage());
  const [searchCache, setSearchCache] = useState<Map<string, CachedSearch>>(() => loadSearchCacheFromStorage());

  // Save to localStorage whenever cache changes
  useEffect(() => {
    saveSoundCacheToStorage(soundCache);
  }, [soundCache]);

  useEffect(() => {
    saveSearchCacheToStorage(searchCache);
  }, [searchCache]);

  // Clean up expired entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setSoundCache((prev) => {
        const filtered = new Map<number, CachedSound>();
        prev.forEach((cached, id) => {
          if ((now - cached.timestamp) < CACHE_EXPIRY_MS) {
            filtered.set(id, cached);
          }
        });
        return filtered;
      });
      
      setSearchCache((prev) => {
        const filtered = new Map<string, CachedSearch>();
        prev.forEach((cached, key) => {
          if ((now - cached.timestamp) < CACHE_EXPIRY_MS) {
            filtered.set(key, cached);
          }
        });
        return filtered;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const getSound = useCallback((soundId: number): SoundObject | undefined => {
    const cached = soundCache.get(soundId);
    if (!cached) return undefined;
    
    // Check if expired
    const now = Date.now();
    if ((now - cached.timestamp) >= CACHE_EXPIRY_MS) {
      // Remove expired entry
      setSoundCache((prev) => {
        const newCache = new Map(prev);
        newCache.delete(soundId);
        return newCache;
      });
      return undefined;
    }
    
    return cached.data;
  }, [soundCache]);

  const setSound = useCallback((sound: SoundObject) => {
    // Extract headers if present (from API response)
    const soundWithHeaders = sound as SoundObject & { __headers?: Record<string, string> };
    const headers = soundWithHeaders.__headers;
    const etag = headers?.ETag;
    const lastModified = headers?.['Last-Modified'];
    
    // Remove headers from sound object before caching
    const soundToCache = { ...sound };
    delete (soundToCache as SoundObject & { __headers?: Record<string, string> }).__headers;
    
    setSoundCache((prev) => {
      const newCache = new Map(prev);
      newCache.set(sound.id, {
        data: soundToCache as SoundObject,
        timestamp: Date.now(),
        etag,
        lastModified,
      });
      return newCache;
    });
  }, []);

  const hasSound = useCallback((soundId: number): boolean => {
    const cached = soundCache.get(soundId);
    if (!cached) return false;
    
    // Check if expired
    const now = Date.now();
    if ((now - cached.timestamp) >= CACHE_EXPIRY_MS) {
      return false;
    }
    
    return true;
  }, [soundCache]);

  const getSearchKey = useCallback((query: string, page: number): string => {
    return `${query.toLowerCase().trim()}:${page}`;
  }, []);

  const getSearchResults = useCallback((query: string, page: number): SoundCollection | undefined => {
    const key = getSearchKey(query, page);
    const cached = searchCache.get(key);
    if (!cached) return undefined;
    
    // Check if expired
    const now = Date.now();
    if ((now - cached.timestamp) >= CACHE_EXPIRY_MS) {
      // Remove expired entry
      setSearchCache((prev) => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return undefined;
    }
    
    return cached.data;
  }, [searchCache, getSearchKey]);

  const setSearchResults = useCallback((query: string, page: number, results: SoundCollection) => {
    const key = getSearchKey(query, page);
    
    // Extract headers if present (from API response)
    const resultsWithHeaders = results as SoundCollection & { __headers?: Record<string, string> };
    const headers = resultsWithHeaders.__headers;
    const etag = headers?.ETag;
    const lastModified = headers?.['Last-Modified'];
    
    // Remove headers from results object before caching
    const resultsToCache = { ...results };
    delete (resultsToCache as SoundCollection & { __headers?: Record<string, string> }).__headers;
    
    setSearchCache((prev) => {
      const newCache = new Map(prev);
      newCache.set(key, {
        data: resultsToCache as SoundCollection,
        timestamp: Date.now(),
        etag,
        lastModified,
      });
      return newCache;
    });
    
    // Also cache individual sounds from search results
    results.results.forEach((sound) => {
      setSound(sound as SoundObject);
    });
  }, [getSearchKey, setSound]);

  const clearCache = useCallback(() => {
    setSoundCache(new Map());
    setSearchCache(new Map());
    localStorage.removeItem(SOUND_CACHE_KEY);
    localStorage.removeItem(SEARCH_CACHE_KEY);
  }, []);

  return (
    <SoundCacheContext.Provider
      value={{
        getSound,
        setSound,
        hasSound,
        getSearchResults,
        setSearchResults,
        clearCache,
      }}
    >
      {children}
    </SoundCacheContext.Provider>
  );
}

export function useSoundCache() {
  const context = useContext(SoundCacheContext);
  if (context === undefined) {
    throw new Error('useSoundCache must be used within a SoundCacheProvider');
  }
  return context;
}

