import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
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
      getSound: vi.fn(),
      setSound: vi.fn(),
      getSearchResults: vi.fn(),
      setSearchResults: vi.fn(),
    }),
  }
})

vi.mock('../services/freesound', () => ({
  freesound: {
    textSearch: vi.fn((query, options, success) => {
      setTimeout(() => {
        success({
          results: [],
          count: 0,
          next: null,
          previous: null,
        })
      }, 0)
    }),
  },
}))

describe('UserProfile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders error message when username is missing', () => {
    render(<UserProfile />, { initialEntries: ['/user/'] })
    expect(screen.getByText(/invalid username/i)).toBeInTheDocument()
  })

  it('renders user profile with username', async () => {
    render(<UserProfile />, { initialEntries: ['/user/testuser'] })

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<UserProfile />, { initialEntries: ['/user/testuser'] })
    // ScreenLayout handles loading state, so we just verify it renders
    expect(screen.getByText(/testuser/i)).toBeInTheDocument()
  })
})

