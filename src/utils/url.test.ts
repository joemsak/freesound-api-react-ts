import { describe, it, expect } from 'vitest'
import { buildUserUrl, buildTagUrl, buildSearchUrl } from './url'

describe('URL Utils', () => {
  describe('buildUserUrl', () => {
    it('builds user URL with page', () => {
      expect(buildUserUrl('testuser', 2)).toBe('/user/testuser?page=2')
    })

    it('builds user URL without page when page is 1', () => {
      expect(buildUserUrl('testuser', 1)).toBe('/user/testuser')
    })
  })

  describe('buildTagUrl', () => {
    it('builds tag URL with page', () => {
      expect(buildTagUrl('music', 2)).toBe('/tag/music?page=2')
    })

    it('builds tag URL without page when page is 1', () => {
      expect(buildTagUrl('music', 1)).toBe('/tag/music')
    })
  })

  describe('buildSearchUrl', () => {
    it('builds search URL with query and page', () => {
      expect(buildSearchUrl('test', 2)).toBe('/?q=test&page=2')
    })

    it('builds search URL with query only when page is 1', () => {
      expect(buildSearchUrl('test', 1)).toBe('/?q=test')
    })

    it('builds search URL without query', () => {
      expect(buildSearchUrl('', 1)).toBe('/?')
    })
  })
})

