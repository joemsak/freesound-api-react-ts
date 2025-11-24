import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import { EmptyState } from './EmptyState'

describe('EmptyState Component', () => {
  it('renders message', () => {
    render(<EmptyState message="No results found" />)
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })
})

