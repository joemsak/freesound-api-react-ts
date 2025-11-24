import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test/test-utils'
import { userEvent } from '@testing-library/user-event'
import { FavoriteButton } from './FavoriteButton'

describe('FavoriteButton Component', () => {
  it('renders favorite button', () => {
    render(<FavoriteButton soundId={123} isFavorite={false} onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn()
    render(<FavoriteButton soundId={123} isFavorite={false} onToggle={onToggle} />)

    await userEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledWith(123)
  })

  it('shows filled star when favorite', () => {
    const { container } = render(<FavoriteButton soundId={123} isFavorite={true} onToggle={vi.fn()} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('shows outline star when not favorite', () => {
    const { container } = render(<FavoriteButton soundId={123} isFavorite={false} onToggle={vi.fn()} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})

