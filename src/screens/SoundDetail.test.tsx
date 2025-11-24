import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { SoundDetail } from './SoundDetail'
import * as FavoritesContext from '../contexts/FavoritesContext'
import * as SoundCacheContext from '../contexts/SoundCacheContext'
import { FavoritesProvider } from '../contexts/FavoritesContext'
import { SoundCacheProvider } from '../contexts/SoundCacheContext'
import { AudioPlayerProvider } from '../contexts/AudioPlayerContext'

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
      getSound: vi.fn((id: number) => {
        if (id === 123) {
          return {
            id: 123,
            name: 'Test Sound',
            username: 'testuser',
            description: 'Test description',
            tags: ['test', 'sound'],
          }
        }
        return null
      }),
      setSound: vi.fn(),
      getSearchResults: vi.fn(),
      setSearchResults: vi.fn(),
    }),
  }
})

vi.mock('../services/freesound', () => ({
  freesound: {
    getSound: vi.fn((id: number, success: (data: { id: number; name: string; username: string }) => void) => {
      if (id === 456) {
        success({
          id: 456,
          name: 'API Sound',
          username: 'apiuser',
          description: 'API description',
          tags: ['api', 'sound'],
        })
      }
    }),
  },
}))

describe('SoundDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithRouter = (path: string) => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <SoundCacheProvider>
          <FavoritesProvider>
            <AudioPlayerProvider>
              <Routes>
                <Route path="/sound/:soundId" element={<SoundDetail />} />
              </Routes>
            </AudioPlayerProvider>
          </FavoritesProvider>
        </SoundCacheProvider>
      </MemoryRouter>
    )
  }

  it('renders loading state initially', () => {
    const { container } = renderWithRouter('/sound/999')

    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('displays sound from cache', () => {
    renderWithRouter('/sound/123')

    expect(screen.getByText('Test Sound')).toBeInTheDocument()
    expect(screen.getByText(/testuser/i)).toBeInTheDocument()
  })

  it('loads sound from API when not in cache', async () => {
    renderWithRouter('/sound/456')

    await waitFor(() => {
      expect(screen.getByText('API Sound')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('shows error for invalid sound ID', () => {
    renderWithRouter('/sound/invalid')

    expect(screen.getByText('Invalid sound ID')).toBeInTheDocument()
  })
})

