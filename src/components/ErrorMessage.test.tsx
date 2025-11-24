import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import { ErrorMessage } from './ErrorMessage'

describe('ErrorMessage Component', () => {
  it('renders error message', () => {
    render(<ErrorMessage message="Test error message" />)
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ErrorMessage message="Test" className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

