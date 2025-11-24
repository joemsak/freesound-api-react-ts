import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import { Routes, Route } from 'react-router-dom'
import { UserProfile } from './UserProfile'
import * as FavoritesContext from '../contexts/FavoritesContext'
import * as SoundCacheContext from '../contexts/SoundCacheContext'

vi.mock('../contexts/FavoritesContext', async () => {
  const actual = await vi.importActual<typeof FavoritesContext>('../contexts/FavoritesContext')
  return {
    ...actual,
    useFavorites: () => ({
      favorites: [],
      toggleFavorite: vi.fn(),
      isFavorite: vi.fn(() => false),
    }),
  }
})

vi.mock('../contexts/SoundCacheContext', async () => {
  const actual = await vi.importActual<typeof SoundCacheContext>('../contexts/SoundCacheContext')
  return {
    ...actual,
    useSoundCache: () => ({
      getSound: vi.fn(() => undefined),
      setSound: vi.fn(),
      getSearchResults: vi.fn(() => undefined),
      setSearchResults: vi.fn(),
    }),
  }
})

vi.mock('../services/freesound', () => ({
  freesound: {
    textSearch: vi.fn((query, options, success) => {
      success({
        results: [],
        count: 0,
        next: null,
        previous: null,
      })
    }),
  },
}))

describe('UserProfile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithRouter = (path: string) => {
    return render(
      <Routes>
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/user/" element={<UserProfile />} />
      </Routes>,
      { initialEntries: [path] }
    )
  }

  it('renders error message when username is missing', () => {
    renderWithRouter('/user/')
    expect(screen.getByText(/invalid username/i)).toBeInTheDocument()
  })

  it('renders user profile with username', async () => {
    renderWithRouter('/user/testuser')
    await waitFor(() => {
      expect(screen.getByText(/no sounds found for testuser/i)).toBeInTheDocument()
    }, { timeout: 1000 })
  })
})

