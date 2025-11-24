import { describe, it, expect } from 'vitest'
import { extractErrorMessage } from './errorHandler'

describe('errorHandler', () => {
  describe('extractErrorMessage', () => {
    it('uses default message for non-XMLHttpRequest errors', () => {
      const error = new Error('Test error message')
      expect(extractErrorMessage(error, 'Default message')).toBe('Default message')
    })

    it('handles XMLHttpRequest with 401 status', () => {
      const xhr = new XMLHttpRequest()
      Object.defineProperty(xhr, 'status', { value: 401, writable: false })
      expect(extractErrorMessage(xhr, 'Default')).toContain('Authentication failed')
    })

    it('handles XMLHttpRequest with 400 status', () => {
      const xhr = new XMLHttpRequest()
      Object.defineProperty(xhr, 'status', { value: 400, writable: false })
      expect(extractErrorMessage(xhr, 'Default')).toContain('Invalid request')
    })

    it('handles XMLHttpRequest with JSON response', () => {
      const xhr = new XMLHttpRequest()
      Object.defineProperty(xhr, 'status', { value: 500, writable: false })
      Object.defineProperty(xhr, 'responseText', { 
        value: JSON.stringify({ detail: 'API error detail' }),
        writable: false 
      })
      expect(extractErrorMessage(xhr, 'Default')).toContain('API error detail')
    })

    it('handles XMLHttpRequest with invalid JSON', () => {
      const xhr = new XMLHttpRequest()
      Object.defineProperty(xhr, 'status', { value: 500, writable: false })
      Object.defineProperty(xhr, 'responseText', { value: 'invalid json', writable: false })
      expect(extractErrorMessage(xhr, 'Default message')).toBe('Default message')
    })

    it('uses default message for unknown error types', () => {
      expect(extractErrorMessage({}, 'Default message')).toBe('Default message')
      expect(extractErrorMessage(null, 'Default message')).toBe('Default message')
      expect(extractErrorMessage(undefined, 'Default message')).toBe('Default message')
    })
  })
})

