import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../test/test-utils'
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
      // Call success immediately
      success({
        results: [],
        count: 0,
        next: null,
        previous: null,
      })
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

  it('renders tag search with tag name', () => {
    render(<TagSearch />, { initialEntries: ['/tag/music'] })
    // Tag name appears in the header - wait for it to render
    expect(screen.getByText(/tag:/i)).toBeInTheDocument()
    expect(screen.getByText('music')).toBeInTheDocument()
  })
})

