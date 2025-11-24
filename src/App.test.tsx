import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from './test/test-utils'
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

  it('renders Home component on root path', () => {
    render(<App />, { initialEntries: ['/'] })

    // Mocked components render immediately
    expect(screen.getByTestId('home-screen')).toBeInTheDocument()
  })

  it('renders Search component on /search path', () => {
    render(<App />, { initialEntries: ['/search?q=test'] })

    // Mocked components render immediately
    expect(screen.getByTestId('search-screen')).toBeInTheDocument()
  })

  it('renders SoundDetail component on /sound/:soundId path', () => {
    render(<App />, { initialEntries: ['/sound/123'] })

    // Mocked components render immediately
    expect(screen.getByTestId('sound-detail-screen')).toBeInTheDocument()
  })

  it('renders UserProfile component on /user/:username path', () => {
    render(<App />, { initialEntries: ['/user/testuser'] })

    // Mocked components render immediately
    expect(screen.getByTestId('user-profile-screen')).toBeInTheDocument()
  })

  it('renders TagSearch component on /tag/:tagName path', () => {
    render(<App />, { initialEntries: ['/tag/music'] })

    // Mocked components render immediately
    expect(screen.getByTestId('tag-search-screen')).toBeInTheDocument()
  })

  it('updates route when navigating between pages', () => {
    render(<App />, { initialEntries: ['/'] })

    expect(screen.getByTestId('home-screen')).toBeInTheDocument()

    // Navigate to search - render with new route
    const { unmount } = render(<App />, { initialEntries: ['/search'] })
    expect(screen.getByTestId('search-screen')).toBeInTheDocument()
    unmount()
  })
})

