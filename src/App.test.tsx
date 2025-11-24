import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from './test/test-utils'
import { MemoryRouter } from 'react-router-dom'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { SoundCacheProvider } from './contexts/SoundCacheContext'
import { AudioPlayerProvider } from './contexts/AudioPlayerContext'
import App from './App'

vi.mock('./contexts/FavoritesContext', () => ({
  __esModule: true,
  useFavorites: () => ({
    favorites: [],
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
  }),
  FavoritesProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('./contexts/SoundCacheContext', () => ({
  __esModule: true,
  useSoundCache: () => ({
    getSound: vi.fn(),
    setSound: vi.fn(),
    getSearchResults: vi.fn(),
    setSearchResults: vi.fn(),
  }),
  SoundCacheProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('./contexts/AudioPlayerContext', () => ({
  __esModule: true,
  useAudioPlayer: () => ({
    playSound: vi.fn(),
    pauseCurrent: vi.fn(),
  }),
  AudioPlayerProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('./screens/Home', () => ({
  __esModule: true,
  default: () => <div data-testid="home-screen">Home Screen</div>,
  Home: () => <div data-testid="home-screen">Home Screen</div>,
}))

vi.mock('./screens/FreesoundSearch', () => ({
  __esModule: true,
  default: () => <div data-testid="search-screen">Search Screen</div>,
  FreesoundSearch: () => <div data-testid="search-screen">Search Screen</div>,
}))

vi.mock('./screens/SoundDetail', () => ({
  __esModule: true,
  default: () => <div data-testid="sound-detail-screen">Sound Detail Screen</div>,
  SoundDetail: () => <div data-testid="sound-detail-screen">Sound Detail Screen</div>,
}))

vi.mock('./screens/UserProfile', () => ({
  __esModule: true,
  default: () => <div data-testid="user-profile-screen">User Profile Screen</div>,
  UserProfile: () => <div data-testid="user-profile-screen">User Profile Screen</div>,
}))

vi.mock('./screens/TagSearch', () => ({
  __esModule: true,
  default: () => <div data-testid="tag-search-screen">Tag Search Screen</div>,
  TagSearch: () => <div data-testid="tag-search-screen">Tag Search Screen</div>,
}))

describe('App Routing Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Home component on root path', () => {
    render(<App />, { initialEntries: ['/'] })

    expect(screen.getByTestId('home-screen')).toBeInTheDocument()
  })

  it('renders Search component on /search path', () => {
    render(<App />, { initialEntries: ['/search?q=test'] })

    expect(screen.getByTestId('search-screen')).toBeInTheDocument()
  })

  it('renders SoundDetail component on /sound/:soundId path', () => {
    render(<App />, { initialEntries: ['/sound/123'] })

    expect(screen.getByTestId('sound-detail-screen')).toBeInTheDocument()
  })

  it('renders UserProfile component on /user/:username path', () => {
    render(<App />, { initialEntries: ['/user/testuser'] })

    expect(screen.getByTestId('user-profile-screen')).toBeInTheDocument()
  })

  it('renders TagSearch component on /tag/:tagName path', () => {
    render(<App />, { initialEntries: ['/tag/music'] })

    expect(screen.getByTestId('tag-search-screen')).toBeInTheDocument()
  })

  it('updates route when navigating between pages', () => {
    const { rerender } = render(<App />, { initialEntries: ['/'] })

    expect(screen.getByTestId('home-screen')).toBeInTheDocument()

    // Re-render with new route - wrap in providers since rerender doesn't use wrapper
    rerender(
      <MemoryRouter initialEntries={['/search']}>
        <SoundCacheProvider>
          <FavoritesProvider>
            <AudioPlayerProvider>
              <App />
            </AudioPlayerProvider>
          </FavoritesProvider>
        </SoundCacheProvider>
      </MemoryRouter>
    )
    expect(screen.getByTestId('search-screen')).toBeInTheDocument()
  })
})

