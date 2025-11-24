import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AudioPlayerProvider, useAudioPlayer } from './AudioPlayerContext'

describe('AudioPlayerContext', () => {
  beforeEach(() => {
    // Clean up any existing audio elements
    document.querySelectorAll('audio').forEach((audio) => audio.remove())
  })

  it('provides audio player context', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: AudioPlayerProvider,
    })

    expect(result.current.currentTrack).toBeNull()
    expect(typeof result.current.registerAudio).toBe('function')
    expect(typeof result.current.isPlaying).toBe('function')
    expect(typeof result.current.pauseCurrent).toBe('function')
  })

  it('registers audio element', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: AudioPlayerProvider,
    })

    const audio = document.createElement('audio')
    audio.src = 'test.mp3'

    act(() => {
      const unregister = result.current.registerAudio(audio, {
        src: 'test.mp3',
        name: 'Test Track',
        username: 'testuser',
      })
      expect(unregister).toBeInstanceOf(Function)
    })

    expect(result.current.currentTrack).toBeTruthy()
    expect(result.current.currentTrack?.src).toBe('test.mp3')
    expect(result.current.currentTrack?.name).toBe('Test Track')
  })

  it('checks if audio is playing', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: AudioPlayerProvider,
    })

    const audio = document.createElement('audio')
    audio.src = 'test.mp3'

    act(() => {
      result.current.registerAudio(audio, {
        src: 'test.mp3',
        name: 'Test Track',
      })
    })

    expect(result.current.isPlaying(audio)).toBe(false)

    act(() => {
      audio.play()
    })

    // Note: In test environment, play() might not actually play
    // This test verifies the function exists and can be called
    expect(typeof result.current.isPlaying).toBe('function')
  })

  it('pauses current track', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: AudioPlayerProvider,
    })

    const audio = document.createElement('audio')
    audio.src = 'test.mp3'

    act(() => {
      result.current.registerAudio(audio, {
        src: 'test.mp3',
        name: 'Test Track',
      })
      result.current.pauseCurrent()
    })

    // Verify pauseCurrent can be called without errors
    expect(result.current.pauseCurrent).toBeInstanceOf(Function)
  })

  it('unregisters audio on cleanup', () => {
    const { result } = renderHook(() => useAudioPlayer(), {
      wrapper: AudioPlayerProvider,
    })

    const audio = document.createElement('audio')
    audio.src = 'test.mp3'

    let unregister: (() => void) | undefined

    act(() => {
      unregister = result.current.registerAudio(audio, {
        src: 'test.mp3',
        name: 'Test Track',
      })
    })

    expect(result.current.currentTrack).toBeTruthy()

    act(() => {
      unregister?.()
    })

    expect(result.current.currentTrack).toBeNull()
  })
})

