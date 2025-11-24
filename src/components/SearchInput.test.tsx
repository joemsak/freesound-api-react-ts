import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test/test-utils'
import { userEvent } from '@testing-library/user-event'
import { SearchInput } from './SearchInput'

describe('SearchInput Component', () => {
  it('renders input and button', () => {
    render(<SearchInput query="" onQueryChange={vi.fn()} onSearch={vi.fn()} loading={false} />)

    expect(screen.getByPlaceholderText(/search for sounds/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('displays query value', () => {
    render(<SearchInput query="test query" onQueryChange={vi.fn()} onSearch={vi.fn()} loading={false} />)

    const input = screen.getByPlaceholderText(/search for sounds/i) as HTMLInputElement
    expect(input.value).toBe('test query')
  })

  it('calls onQueryChange when input changes', async () => {
    const onQueryChange = vi.fn()
    render(<SearchInput query="" onQueryChange={onQueryChange} onSearch={vi.fn()} loading={false} />)

    const input = screen.getByPlaceholderText(/search for sounds/i)
    await userEvent.type(input, 'test')

    expect(onQueryChange).toHaveBeenCalled()
  })

  it('calls onSearch when form is submitted', async () => {
    const onSearch = vi.fn()
    render(<SearchInput query="test" onQueryChange={vi.fn()} onSearch={onSearch} loading={false} />)

    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    expect(onSearch).toHaveBeenCalled()
  })

  it('does not call onSearch when loading', async () => {
    const onSearch = vi.fn()
    render(<SearchInput query="test" onQueryChange={vi.fn()} onSearch={onSearch} loading={true} />)

    const input = screen.getByPlaceholderText(/search for sounds/i)
    await userEvent.type(input, '{Enter}')

    expect(onSearch).not.toHaveBeenCalled()
  })

  it('calls onSearch when Enter key is pressed', async () => {
    const onSearch = vi.fn()
    render(<SearchInput query="test" onQueryChange={vi.fn()} onSearch={onSearch} loading={false} />)

    const input = screen.getByPlaceholderText(/search for sounds/i)
    await userEvent.type(input, '{Enter}')

    expect(onSearch).toHaveBeenCalled()
  })

  it('shows loading state', () => {
    render(<SearchInput query="" onQueryChange={vi.fn()} onSearch={vi.fn()} loading={true} />)

    expect(screen.getByRole('button', { name: /searching/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /searching/i })).toBeDisabled()
  })
})

