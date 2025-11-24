import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from './test/test-utils'
import App from './App'
import * as FavoritesContext from './contexts/FavoritesContext'
import * as SoundCacheContext from './contexts/SoundCacheContext'
import * as AudioPlayerContext from './contexts/AudioPlayerContext'

// Mock the contexts to avoid API calls
vi.mock('./contexts/FavoritesContext', async () => {
  const actual = await vi.importActual<typeof FavoritesContext>('./contexts/FavoritesContext')
  return {
    ...actual,
    useFavorites: () => ({
      favorites: [],
      toggleFavorite: vi.fn(),
      isFavorite: vi.fn(() => false),
    }),
  }
})

vi.mock('./contexts/SoundCacheContext', async () => {
  const actual = await vi.importActual<typeof SoundCacheContext>('./contexts/SoundCacheContext')
  return {
    ...actual,
    useSoundCache: () => ({
      getSound: vi.fn(),
      setSound: vi.fn(),
      getSearchResults: vi.fn(),
      setSearchResults: vi.fn(),
    }),
  }
})

vi.mock('./contexts/AudioPlayerContext', async () => {
  const actual = await vi.importActual<typeof AudioPlayerContext>('./contexts/AudioPlayerContext')
  return {
    ...actual,
    useAudioPlayer: () => ({
      playSound: vi.fn(),
      pauseCurrent: vi.fn(),
    }),
  }
})

// Mock the screens to avoid API calls
vi.mock('./screens/Home', () => ({
  Home: () => <div data-testid="home-screen">Home Screen</div>,
}))

vi.mock('./screens/FreesoundSearch', () => ({
  FreesoundSearch: () => <div data-testid="search-screen">Search Screen</div>,
}))

vi.mock('./screens/SoundDetail', () => ({
  SoundDetail: () => <div data-testid="sound-detail-screen">Sound Detail Screen</div>,
}))

vi.mock('./screens/UserProfile', () => ({
  UserProfile: () => <div data-testid="user-profile-screen">User Profile Screen</div>,
}))

vi.mock('./screens/TagSearch', () => ({
  TagSearch: () => <div data-testid="tag-search-screen">Tag Search Screen</div>,
}))

describe('App Routing Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Home component on root path', async () => {
    render(<App />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(screen.getByTestId('home-screen')).toBeInTheDocument()
    })
  })

  it('renders Search component on /search path', async () => {
    render(<App />, { initialEntries: ['/search?q=test'] })

    await waitFor(() => {
      expect(screen.getByTestId('search-screen')).toBeInTheDocument()
    })
  })

  it('renders SoundDetail component on /sound/:soundId path', async () => {
    render(<App />, { initialEntries: ['/sound/123'] })

    await waitFor(() => {
      expect(screen.getByTestId('sound-detail-screen')).toBeInTheDocument()
    })
  })

  it('renders UserProfile component on /user/:username path', async () => {
    render(<App />, { initialEntries: ['/user/testuser'] })

    await waitFor(() => {
      expect(screen.getByTestId('user-profile-screen')).toBeInTheDocument()
    })
  })

  it('renders TagSearch component on /tag/:tagName path', async () => {
    render(<App />, { initialEntries: ['/tag/music'] })

    await waitFor(() => {
      expect(screen.getByTestId('tag-search-screen')).toBeInTheDocument()
    })
  })

  it('updates route when navigating between pages', async () => {
    const { rerender } = render(<App />, { initialEntries: ['/'] })

    expect(screen.getByTestId('home-screen')).toBeInTheDocument()

    // Navigate to search
    rerender(<App />)
    render(<App />, { initialEntries: ['/search'] })

    await waitFor(() => {
      expect(screen.getByTestId('search-screen')).toBeInTheDocument()
    })
  })
})

