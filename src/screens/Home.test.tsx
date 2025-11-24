import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../test/test-utils'
import { Home } from './Home'
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

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input', () => {
    render(<Home />)
    expect(screen.getByPlaceholderText(/search for sounds/i)).toBeInTheDocument()
  })

  it('renders home page content', () => {
    render(<Home />)
    // Home page should render - exact content depends on API response
    expect(screen.getByPlaceholderText(/search for sounds/i)).toBeInTheDocument()
  })
})

