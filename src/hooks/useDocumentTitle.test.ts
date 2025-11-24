import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDocumentTitle } from './useDocumentTitle'

describe('useDocumentTitle Hook', () => {
  const originalTitle = document.title

  beforeEach(() => {
    document.title = originalTitle
  })

  afterEach(() => {
    document.title = originalTitle
  })

  it('sets document title with suffix', () => {
    renderHook(() => useDocumentTitle('Test Title'))
    expect(document.title).toBe('Test Title - Freesound API')
  })

  it('updates document title when it changes', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'Initial Title' },
    })

    expect(document.title).toBe('Initial Title - Freesound API')

    rerender({ title: 'Updated Title' })
    expect(document.title).toBe('Updated Title - Freesound API')
  })

  it('uses base title when title is empty', () => {
    renderHook(() => useDocumentTitle(''))
    expect(document.title).toBe('Freesound API')
  })
})

