import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

const FAVORITES_KEY = 'freesound_favorites';

interface FavoritesContextType {
  favorites: number[];
  addFavorite: (soundId: number) => void;
  removeFavorite: (soundId: number) => void;
  toggleFavorite: (soundId: number) => void;
  isFavorite: (soundId: number) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Load initial favorites from localStorage
function loadFavoritesFromStorage(): number[] {
  const stored = localStorage.getItem(FAVORITES_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>(loadFavoritesFromStorage);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (soundId: number) => {
    setFavorites((prev) => {
      if (!prev.includes(soundId)) {
        return [...prev, soundId];
      }
      return prev;
    });
  };

  const removeFavorite = (soundId: number) => {
    setFavorites((prev) => prev.filter((id) => id !== soundId));
  };

  const toggleFavorite = (soundId: number) => {
    setFavorites((prev) => {
      if (prev.includes(soundId)) {
        return prev.filter((id) => id !== soundId);
      } else {
        return [...prev, soundId];
      }
    });
  };

  const isFavorite = (soundId: number): boolean => {
    return favorites.includes(soundId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

