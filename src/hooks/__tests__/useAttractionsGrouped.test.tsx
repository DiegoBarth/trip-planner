import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAttractionsGrouped } from '../useAttractionsGrouped'
import { CountryContext } from '@/contexts/CountryContext'
import type { ReactNode } from 'react'
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
    couplePrice: 1000,
    currency: 'JPY',
    priceInBRL: 50,
    visited: false,
    needsReservation: false,
    ...overrides,
  }
}

function createWrapper(day: number | 'all' = 'all') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <CountryContext.Provider
        value={{
          country: 'all',
          setCountry: () => {},
          day,
          setDay: () => {},
        }}
      >
        {children}
      </CountryContext.Provider>
    )
  }
}

describe('useAttractionsGrouped', () => {
  it('returns groupedByCountry and sortedCountryEntries', () => {
    const attractions = [
      makeAttraction({ id: 1, country: 'japan', day: 1, order: 0 }),
      makeAttraction({ id: 2, country: 'japan', day: 1, order: 1 }),
      makeAttraction({ id: 3, country: 'south-korea', day: 2, order: 0 }),
    ]
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped(attractions), {
      wrapper: Wrapper,
    })

    expect(result.current.displayAttractions).toHaveLength(3)
    expect(Object.keys(result.current.groupedByCountry)).toContain('japan')
    expect(Object.keys(result.current.groupedByCountry)).toContain('south-korea')
    expect(result.current.sortedCountryEntries.length).toBeGreaterThanOrEqual(1)
    expect(result.current.COUNTRIES).toBeDefined()
  })

  it('isAllDaysView is true when day is "all"', () => {
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped([]), { wrapper: Wrapper })
    expect(result.current.isAllDaysView).toBe(true)
  })

  it('isAllDaysView is false when day is a number', () => {
    const Wrapper = createWrapper(1)
    const { result } = renderHook(() => useAttractionsGrouped([makeAttraction({ day: 1 })]), {
      wrapper: Wrapper,
    })
    expect(result.current.isAllDaysView).toBe(false)
  })

  it('isReadyForTotals is true when all days view and displayAttractions length matches attractions', () => {
    const attractions = [makeAttraction({ id: 1 }), makeAttraction({ id: 2 })]
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped(attractions), { wrapper: Wrapper })
    expect(result.current.displayAttractions).toHaveLength(2)
    expect(result.current.isReadyForTotals).toBe(true)
  })

  it('setDisplayAttractions updates displayAttractions', () => {
    const attractions = [makeAttraction({ id: 1 }), makeAttraction({ id: 2 })]
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped(attractions), { wrapper: Wrapper })
    expect(result.current.displayAttractions).toHaveLength(2)
    act(() => {
      result.current.setDisplayAttractions([makeAttraction({ id: 1 })])
    })
    expect(result.current.displayAttractions).toHaveLength(1)
  })

  it('getCountryTotalCouplePrice returns null for empty days', () => {
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped([]), { wrapper: Wrapper })
    expect(result.current.getCountryTotalCouplePrice({})).toBeNull()
    expect(result.current.getCountryTotalCouplePrice({ 1: [] })).toBeNull()
  })

  it('getCountryTotalCouplePrice returns formatted currency for non-empty', () => {
    const att = makeAttraction({ couplePrice: 1000, currency: 'JPY' })
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped([]), { wrapper: Wrapper })
    const total = result.current.getCountryTotalCouplePrice({ 1: [att] })
    expect(total).not.toBeNull()
    expect(typeof total).toBe('string')
  })

  it('getCountryTotalPriceBrl returns sum of priceInBRL', () => {
    const att1 = makeAttraction({ priceInBRL: 50 })
    const att2 = makeAttraction({ priceInBRL: 30 })
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped([]), { wrapper: Wrapper })
    expect(result.current.getCountryTotalPriceBrl({ 1: [att1, att2] })).toBe(80)
  })

  it('getDayTotalCouplePrice returns null for empty array', () => {
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped([]), { wrapper: Wrapper })
    expect(result.current.getDayTotalCouplePrice([])).toBeNull()
  })

  it('getDayTotalCouplePrice returns formatted string for non-empty', () => {
    const att = makeAttraction({ couplePrice: 500, currency: 'BRL' })
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped([]), { wrapper: Wrapper })
    const total = result.current.getDayTotalCouplePrice([att])
    expect(total).not.toBeNull()
    expect(typeof total).toBe('string')
  })

  it('getDayTotalPriceBrl returns sum', () => {
    const att1 = makeAttraction({ priceInBRL: 10 })
    const att2 = makeAttraction({ priceInBRL: 20 })
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped([]), { wrapper: Wrapper })
    expect(result.current.getDayTotalPriceBrl([att1, att2])).toBe(30)
  })

  it('groupedByCountry uses "outros" when country is undefined', () => {
    const att = makeAttraction({ id: 1, country: undefined } as Partial<Attraction>)
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped([att]), { wrapper: Wrapper })
    expect(result.current.groupedByCountry.outros).toBeDefined()
    expect(result.current.groupedByCountry.outros[1]).toHaveLength(1)
  })

  it('sortedCountryEntries are sorted by earliest date then name', () => {
    const att1 = makeAttraction({ id: 1, country: 'japan', day: 1, date: '2025-03-02' })
    const att2 = makeAttraction({ id: 2, country: 'south-korea', day: 1, date: '2025-03-01' })
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped([att1, att2]), { wrapper: Wrapper })
    const entries = result.current.sortedCountryEntries
    expect(entries.length).toBe(2)
    const firstCountry = entries[0][0]
    const secondCountry = entries[1][0]
    expect([firstCountry, secondCountry].sort()).toEqual(['japan', 'south-korea'].sort())
  })

  it('exposes formatDate and formatCurrency', () => {
    const Wrapper = createWrapper('all')
    const { result } = renderHook(() => useAttractionsGrouped([]), { wrapper: Wrapper })
    expect(typeof result.current.formatDate).toBe('function')
    expect(typeof result.current.formatCurrency).toBe('function')
  })
})
