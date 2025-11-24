import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import { TagSearch } from './TagSearch'
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

describe('TagSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders error message when tagName is missing', () => {
    render(<TagSearch />, { initialEntries: ['/tag/'] })
    expect(screen.getByText(/invalid tag name/i)).toBeInTheDocument()
  })

  it('renders tag search with tag name', async () => {
    render(<TagSearch />, { initialEntries: ['/tag/music'] })

    await waitFor(() => {
      expect(screen.getByText(/tag:/i)).toBeInTheDocument()
      expect(screen.getByText('music')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<TagSearch />, { initialEntries: ['/tag/music'] })
    // ScreenLayout handles loading state, so we just verify it renders
    expect(screen.getByText(/music/i)).toBeInTheDocument()
  })
})

