import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getMapsUrl, openInMaps } from '../mapsUrl'

describe('mapsUrl', () => {
  describe('getMapsUrl', () => {
    it('returns Google Maps URL when country is not south-korea', () => {
      expect(getMapsUrl(35.65, 139.74, 'japan')).toBe(
        'https://www.google.com/maps/search/?api=1&query=35.65,139.74'
      )
      expect(getMapsUrl(37.5, 127, 'general')).toContain('google.com/maps')
      expect(getMapsUrl(0, 0, 'all')).toContain('google.com/maps')
    })

    it('returns Naver Map URL when country is south-korea', () => {
      const url = getMapsUrl(37.5, 127, 'south-korea')
      expect(url).toBe('https://map.naver.com/v5/?c=127,37.5,15,0,0,0,dh')
    })
  })

  describe('openInMaps', () => {
    beforeEach(() => {
      vi.stubGlobal('window', { open: vi.fn() })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('opens Google Maps URL in new tab when country is not south-korea', () => {
      openInMaps(35.65, 139.74, 'japan')
      expect(window.open).toHaveBeenCalledWith(
        'https://www.google.com/maps/search/?api=1&query=35.65,139.74',
        '_blank'
      )
    })

    it('opens Naver Map URL in new tab when country is south-korea', () => {
      openInMaps(37.5, 127, 'south-korea')
      expect(window.open).toHaveBeenCalledWith(
        'https://map.naver.com/v5/?c=127,37.5,15,0,0,0,dh',
        '_blank'
      )
    })
  })
})
