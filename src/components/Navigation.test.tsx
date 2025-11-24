import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../test/test-utils'
import { userEvent } from '@testing-library/user-event'
import { Navigation } from './Navigation'
import * as FavoritesContext from '../contexts/FavoritesContext'

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

describe('Navigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders navigation with logo', () => {
    render(<Navigation onToggleFavorites={vi.fn()} favoritesOpen={false} />)

    expect(screen.getByText(/Freesound/i)).toBeInTheDocument()
  })

  it('shows Home link when not on home page', () => {
    render(<Navigation onToggleFavorites={vi.fn()} favoritesOpen={false} />, {
      initialEntries: ['/search'],
    })

    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('hides Home link when on home page', () => {
    render(<Navigation onToggleFavorites={vi.fn()} favoritesOpen={false} />, {
      initialEntries: ['/'],
    })

    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  it('calls onToggleFavorites when favorites button is clicked', async () => {
    const onToggleFavorites = vi.fn()
    render(<Navigation onToggleFavorites={onToggleFavorites} favoritesOpen={false} />)

    const favoritesButton = screen.getByTitle(/favorites/i)
    await userEvent.click(favoritesButton)

    expect(onToggleFavorites).toHaveBeenCalledTimes(1)
  })
})

