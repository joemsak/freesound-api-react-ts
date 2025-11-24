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
      getSound: vi.fn(() => undefined),
      setSound: vi.fn(),
      getSearchResults: vi.fn(() => undefined), // Return undefined to force API call
      setSearchResults: vi.fn(),
    }),
  }
})

vi.mock('../services/freesound', () => ({
  freesound: {
    textSearch: vi.fn((query, options, success) => {
      // Call success immediately, don't use setTimeout
      success({
        results: [],
        count: 0,
        next: null,
        previous: null,
      })
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

  it('renders search input when query is provided', async () => {
    render(<FreesoundSearch />, { initialEntries: ['/search?q=test'] })
    // When query is provided, SearchInput is hidden but results header should appear
    // Wait for API call to complete
    await waitFor(() => {
      // Either results header or empty state should appear
      const hasResults = screen.queryByText(/showing/i) !== null
      const hasEmpty = screen.queryByText(/no sounds found/i) !== null
      expect(hasResults || hasEmpty).toBe(true)
    }, { timeout: 1000 })
    // SearchInput is hidden when query exists, so verify query appears in results
    expect(screen.getByText(/test/i)).toBeInTheDocument()
  })

  it('displays empty state when no query', () => {
    render(<FreesoundSearch />, { initialEntries: ['/search'] })
    expect(screen.getByText(/enter a search query/i)).toBeInTheDocument()
  })
})

