import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import { ScreenLayout } from './ScreenLayout'

describe('ScreenLayout Component', () => {
  it('renders children when hasData is true', () => {
    render(
      <ScreenLayout loading={false} error={null} hasData={true}>
        <div>Test Content</div>
      </ScreenLayout>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('shows skeleton when loading and no data', () => {
    const { container } = render(
      <ScreenLayout loading={true} error={null} hasData={false}>
        <div>Test Content</div>
      </ScreenLayout>
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows error message when error exists', () => {
    render(
      <ScreenLayout loading={false} error="Test error" hasData={false}>
        <div>Test Content</div>
      </ScreenLayout>
    )
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getByText('← Back to Search')).toBeInTheDocument()
  })

  it('shows empty state when no data and not loading', () => {
    render(
      <ScreenLayout loading={false} error={null} hasData={false} emptyMessage="No results">
        <div>Test Content</div>
      </ScreenLayout>
    )
    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('hides back link when showBackLink is false', () => {
    render(
      <ScreenLayout loading={false} error="Test error" hasData={false} showBackLink={false}>
        <div>Test Content</div>
      </ScreenLayout>
    )
    expect(screen.queryByText('← Back to Search')).not.toBeInTheDocument()
  })
})

