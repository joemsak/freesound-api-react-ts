import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SoundCacheProvider, useSoundCache } from './SoundCacheContext'
import type { SoundObject, SoundCollection } from '../services/freesound'

const mockSound: SoundObject = {
  id: 1,
  name: 'Test Sound',
  username: 'testuser',
  tags: ['test'],
  description: 'Test description',
  created: '2024-01-01',
  license: 'CC0',
} as SoundObject

const mockCollection: SoundCollection = {
  results: [mockSound],
  count: 1,
  next: null,
  previous: null,
} as SoundCollection

describe('SoundCacheContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('provides sound cache context', () => {
    const { result } = renderHook(() => useSoundCache(), {
      wrapper: SoundCacheProvider,
    })

    expect(result.current.getSound(1)).toBeUndefined()
    expect(result.current.hasSound(1)).toBe(false)
  })

  it('stores and retrieves sounds', () => {
    const { result } = renderHook(() => useSoundCache(), {
      wrapper: SoundCacheProvider,
    })

    act(() => {
      result.current.setSound(mockSound)
    })

    expect(result.current.hasSound(1)).toBe(true)
    const retrieved = result.current.getSound(1)
    expect(retrieved?.id).toBe(1)
    expect(retrieved?.name).toBe('Test Sound')
  })

  it('stores and retrieves search results', () => {
    const { result } = renderHook(() => useSoundCache(), {
      wrapper: SoundCacheProvider,
    })

    act(() => {
      result.current.setSearchResults('test', 1, mockCollection)
    })

    const retrieved = result.current.getSearchResults('test', 1)
    expect(retrieved).toBeTruthy()
    expect(retrieved?.count).toBe(1)
    expect(retrieved?.results).toHaveLength(1)
  })

  it('clears cache', () => {
    const { result } = renderHook(() => useSoundCache(), {
      wrapper: SoundCacheProvider,
    })

    act(() => {
      result.current.setSound(mockSound)
      result.current.setSearchResults('test', 1, mockCollection)
      result.current.clearCache()
    })

    expect(result.current.hasSound(1)).toBe(false)
    expect(result.current.getSearchResults('test', 1)).toBeUndefined()
  })
})

