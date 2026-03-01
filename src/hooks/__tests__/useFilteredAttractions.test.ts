import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFilteredAttractions } from '../useFilteredAttractions'
import type { Attraction } from '@/types/Attraction'

function makeAttraction(overrides: Partial<Attraction> = {}): Attraction {
  return {
    id: 1,
    name: 'A',
    country: 'japan',
    city: 'Tokyo',
    day: 1,
    date: '2025-03-01',
    dayOfWeek: 'Mon',
    type: 'temple',
    order: 0,
    couplePrice: 0,
    currency: 'JPY',
    priceInBRL: 0,
    visited: false,
    needsReservation: false,
    lat: 35.68,
    lng: 139.69,
    ...overrides,
  }
}

describe('useFilteredAttractions', () => {
  it('returns all attractions when country is general and day is all and all have coords', () => {
    const attractions = [
      makeAttraction({ id: 1, country: 'japan', day: 1, lat: 1, lng: 1 }),
      makeAttraction({ id: 2, country: 'south-korea', day: 2, lat: 2, lng: 2 }),
    ]
    const { result } = renderHook(() =>
      useFilteredAttractions(attractions, 'general', 'all')
    )
    expect(result.current).toHaveLength(2)
  })

  it('filters by country', () => {
    const attractions = [
      makeAttraction({ id: 1, country: 'japan', lat: 1, lng: 1 }),
      makeAttraction({ id: 2, country: 'south-korea', lat: 2, lng: 2 }),
    ]
    const { result } = renderHook(() =>
      useFilteredAttractions(attractions, 'japan', 'all')
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].country).toBe('japan')
  })

  it('filters by day', () => {
    const attractions = [
      makeAttraction({ id: 1, day: 1, lat: 1, lng: 1 }),
      makeAttraction({ id: 2, day: 2, lat: 2, lng: 2 }),
    ]
    const { result } = renderHook(() =>
      useFilteredAttractions(attractions, 'general', 1)
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].day).toBe(1)
  })

  it('excludes attractions without valid coords', () => {
    const attractions = [
      makeAttraction({ id: 1, lat: 0, lng: 0 }),
      makeAttraction({ id: 2, lat: 35.68, lng: 139.69 }),
    ]
    const { result } = renderHook(() =>
      useFilteredAttractions(attractions, 'general', 'all')
    )
    expect(result.current).toHaveLength(1)
    expect(result.current[0].id).toBe(2)
  })
})
