import { describe, it, expect } from 'vitest'
import { isMappableAttraction } from '../typeGuards'

describe('isMappableAttraction', () => {
  it('returns true when lat and lng are numbers', () => {
    const a = { id: 1, name: 'x', lat: 35.6, lng: 139.7 } as unknown
    expect(isMappableAttraction(a as import('@/types/Attraction').Attraction)).toBe(true)
  })
  it('returns false when lat is missing', () => {
    const a = { id: 1, name: 'x', lng: 139.7 } as unknown
    expect(isMappableAttraction(a as import('@/types/Attraction').Attraction)).toBe(false)
  })
  it('returns false when lng is missing', () => {
    const a = { id: 1, name: 'x', lat: 35.6 } as unknown
    expect(isMappableAttraction(a as import('@/types/Attraction').Attraction)).toBe(false)
  })
  it('returns false when lat is not a number', () => {
    const a = { id: 1, name: 'x', lat: '35.6', lng: 139.7 } as unknown
    expect(isMappableAttraction(a as import('@/types/Attraction').Attraction)).toBe(false)
  })
})
