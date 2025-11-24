import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import { FreesoundSearch } from './FreesoundSearch'
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

describe('FreesoundSearch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input when no query', () => {
    render(<FreesoundSearch />, { initialEntries: ['/search'] })
    expect(screen.getByPlaceholderText(/search for sounds/i)).toBeInTheDocument()
  })

  it('renders search results when query is provided', async () => {
    render(<FreesoundSearch />, { initialEntries: ['/search?q=test'] })

    await waitFor(() => {
      expect(screen.getByText(/search results/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('displays empty state when no query', () => {
    render(<FreesoundSearch />, { initialEntries: ['/search'] })
    expect(screen.getByText(/enter a search query/i)).toBeInTheDocument()
  })
})

