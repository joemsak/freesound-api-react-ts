import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import { Tags } from './Tags'

describe('Tags Component', () => {
  it('renders tags', () => {
    render(<Tags tags={['tag1', 'tag2', 'tag3']} />)

    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
    expect(screen.getByText('tag3')).toBeInTheDocument()
  })

  it('renders nothing when tags array is empty', () => {
    const { container } = render(<Tags tags={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when tags is null', () => {
    const { container } = render(<Tags tags={null as any} />)
    expect(container.firstChild).toBeNull()
  })

  it('limits tags when maxTags is provided', () => {
    render(<Tags tags={['tag1', 'tag2', 'tag3', 'tag4', 'tag5']} maxTags={3} />)

    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
    expect(screen.getByText('tag3')).toBeInTheDocument()
    expect(screen.queryByText('tag4')).not.toBeInTheDocument()
    expect(screen.queryByText('tag5')).not.toBeInTheDocument()
  })

  it('applies rounded variant styling', () => {
    const { container } = render(<Tags tags={['tag1']} variant="rounded" />)
    const tag = screen.getByText('tag1')
    expect(tag.className).toContain('rounded-full')
  })
})

