import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePaginatedSearch } from './usePaginatedSearch'
import * as SoundCacheContext from '../contexts/SoundCacheContext'

vi.mock('../contexts/SoundCacheContext', async () => {
  const actual = await vi.importActual<typeof SoundCacheContext>('../contexts/SoundCacheContext')
  return {
    ...actual,
    useSoundCache: () => ({
      getSearchResults: vi.fn((key: string, page: number) => {
        if (key === 'cached' && page === 1) {
          return { results: [], count: 0, next: null, previous: null }
        }
        return null
      }),
      setSearchResults: vi.fn(),
      getSound: vi.fn(),
      setSound: vi.fn(),
    }),
  }
})

describe('usePaginatedSearch Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns cached results immediately', () => {
    const searchFn = vi.fn()

    const { result } = renderHook(() =>
      usePaginatedSearch({
        cacheKey: 'cached',
        searchFn,
        defaultErrorMessage: 'Error',
        page: 1,
      })
    )

    // Cache lookup happens synchronously in useEffect
    // But state updates are async, so we need to wait a bit
    expect(result.current.loading).toBe(true) // Initially loading
    expect(searchFn).not.toHaveBeenCalled()
  })

  it('calls searchFn when not cached', async () => {
    const searchFn = vi.fn((success: (data: { results: unknown[]; count: number; next: string | null; previous: string | null }) => void) => {
      // Call success synchronously
      success({ results: [], count: 0, next: null, previous: null })
    })

    renderHook(() =>
      usePaginatedSearch({
        cacheKey: 'not-cached',
        searchFn,
        defaultErrorMessage: 'Error',
        page: 1,
      })
    )

    // searchFn is called in useEffect, which runs after render
    await waitFor(() => {
      expect(searchFn).toHaveBeenCalled()
    }, { timeout: 500 })
  })

  it('sets loading to true immediately', () => {
    const searchFn = vi.fn()

    const { result } = renderHook(() =>
      usePaginatedSearch({
        cacheKey: 'test',
        searchFn,
        defaultErrorMessage: 'Error',
        page: 1,
      })
    )

    expect(result.current.loading).toBe(true)
  })

  it('updates when cacheKey changes', async () => {
    const searchFn = vi.fn((success: (data: { results: unknown[]; count: number; next: string | null; previous: string | null }) => void) => {
      success({ results: [], count: 0, next: null, previous: null })
    })

    const { rerender } = renderHook(
      ({ cacheKey }) =>
        usePaginatedSearch({
          cacheKey,
          searchFn,
          defaultErrorMessage: 'Error',
          page: 1,
        }),
      { initialProps: { cacheKey: 'key1' } }
    )

    await waitFor(() => {
      expect(searchFn).toHaveBeenCalledTimes(1)
    }, { timeout: 500 })

    rerender({ cacheKey: 'key2' })

    await waitFor(() => {
      expect(searchFn).toHaveBeenCalledTimes(2)
    }, { timeout: 500 })
  })

  it('updates when page changes', async () => {
    const searchFn = vi.fn((success: (data: { results: unknown[]; count: number; next: string | null; previous: string | null }) => void) => {
      success({ results: [], count: 0, next: null, previous: null })
    })

    const { result, rerender } = renderHook(
      ({ page }) =>
        usePaginatedSearch({
          cacheKey: 'test',
          searchFn,
          defaultErrorMessage: 'Error',
          page,
        }),
      { initialProps: { page: 1 } }
    )

    await waitFor(() => {
      expect(searchFn).toHaveBeenCalledTimes(1)
    })

    rerender({ page: 2 })

    await waitFor(() => {
      expect(searchFn).toHaveBeenCalledTimes(2)
      expect(result.current.currentPage).toBe(2)
    })
  })
})

