import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import { SoundTitle } from './SoundTitle'

describe('SoundTitle Component', () => {
  it('renders sound name and username', () => {
    render(
      <SoundTitle
        soundId={123}
        soundName="Test Sound"
        username="testuser"
      />
    )
    expect(screen.getByText('Test Sound')).toBeInTheDocument()
    expect(screen.getByText(/testuser/i)).toBeInTheDocument()
  })

  it('links to sound detail page', () => {
    render(
      <SoundTitle
        soundId={123}
        soundName="Test Sound"
        username="testuser"
      />
    )
    const link = screen.getByRole('link', { name: /test sound/i })
    expect(link).toHaveAttribute('href', '/sound/123')
  })

  it('links to user profile', () => {
    render(
      <SoundTitle
        soundId={123}
        soundName="Test Sound"
        username="testuser"
      />
    )
    const userLink = screen.getByRole('link', { name: 'testuser' })
    expect(userLink).toHaveAttribute('href', '/user/testuser')
  })
})

