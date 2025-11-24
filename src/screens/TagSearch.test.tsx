import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
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

  const renderWithRouter = (path: string) => {
    return render(
      <Routes>
        <Route path="/tag/:tagName" element={<TagSearch />} />
        <Route path="/tag/" element={<TagSearch />} />
      </Routes>,
      { initialEntries: [path] }
    )
  }

  it('renders error message when tagName is missing', () => {
    renderWithRouter('/tag/')
    expect(screen.getByText(/invalid tag name/i)).toBeInTheDocument()
  })

  it('renders tag search with tag name', async () => {
    renderWithRouter('/tag/music')
    // Wait for component to render - tag name should appear in header
    await waitFor(() => {
      // Tag name appears in the header
      expect(screen.getByText('music')).toBeInTheDocument()
    }, { timeout: 1000 })
    // Verify tag header is rendered
    expect(screen.getByText(/tag:/i)).toBeInTheDocument()
  })
})

