import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { FavoritesProvider, useFavorites } from './FavoritesContext'

describe('FavoritesContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('provides favorites context', () => {
    const { result } = renderHook(() => useFavorites(), {
      wrapper: FavoritesProvider,
    })

    expect(result.current.favorites).toEqual([])
    expect(result.current.isFavorite(1)).toBe(false)
  })

  it('adds favorite', () => {
    const { result } = renderHook(() => useFavorites(), {
      wrapper: FavoritesProvider,
    })

    act(() => {
      result.current.addFavorite(1)
    })

    expect(result.current.favorites).toContain(1)
    expect(result.current.isFavorite(1)).toBe(true)
  })

  it('removes favorite', () => {
    const { result } = renderHook(() => useFavorites(), {
      wrapper: FavoritesProvider,
    })

    act(() => {
      result.current.addFavorite(1)
      result.current.removeFavorite(1)
    })

    expect(result.current.favorites).not.toContain(1)
    expect(result.current.isFavorite(1)).toBe(false)
  })

  it('toggles favorite', () => {
    const { result } = renderHook(() => useFavorites(), {
      wrapper: FavoritesProvider,
    })

    act(() => {
      result.current.toggleFavorite(1)
    })

    expect(result.current.isFavorite(1)).toBe(true)

    act(() => {
      result.current.toggleFavorite(1)
    })

    expect(result.current.isFavorite(1)).toBe(false)
  })

  it('persists favorites to localStorage', () => {
    const { result } = renderHook(() => useFavorites(), {
      wrapper: FavoritesProvider,
    })

    act(() => {
      result.current.addFavorite(1)
      result.current.addFavorite(2)
    })

    const stored = localStorage.getItem('freesound_favorites')
    expect(stored).toBeTruthy()
    const parsed = JSON.parse(stored!)
    expect(parsed).toContain(1)
    expect(parsed).toContain(2)
  })

  it('loads favorites from localStorage', () => {
    localStorage.setItem('freesound_favorites', JSON.stringify([1, 2, 3]))

    const { result } = renderHook(() => useFavorites(), {
      wrapper: FavoritesProvider,
    })

    expect(result.current.favorites).toEqual([1, 2, 3])
    expect(result.current.isFavorite(1)).toBe(true)
  })

  it('clears all favorites', () => {
    const { result } = renderHook(() => useFavorites(), {
      wrapper: FavoritesProvider,
    })

    act(() => {
      result.current.addFavorite(1)
      result.current.addFavorite(2)
      result.current.clearFavorites()
    })

    expect(result.current.favorites).toEqual([])
  })
})

