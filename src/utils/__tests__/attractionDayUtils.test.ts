import { describe, it, expect } from 'vitest'
import {
  applyAutoDays,
  normalizeOrderByDate,
  getAutoDayForDate,
  getNextOrderForDate,
} from '../attractionDayUtils'

function makeAttraction(overrides: Partial<{
  id: number
  date: string
  country: import('@/types/Attraction').Country
  day: number
  order: number
}> = {}) {
  return {
    id: 1,
    name: 'A',
    country: 'japan' as const,
    city: 'Tokyo',
    date: '2025-03-01',
    day: 1,
    order: 1,
    type: 'temple' as const,
    visited: false,
    needsReservation: false,
    couplePrice: 0,
    currency: 'JPY' as const,
    priceInBRL: 0,
    ...overrides,
  } as import('@/types/Attraction').Attraction
}

describe('applyAutoDays', () => {
  it('assigns day by date order per country', () => {
    const attractions = [
      makeAttraction({ id: 1, date: '2025-03-02', country: 'japan', day: 0 }),
      makeAttraction({ id: 2, date: '2025-03-01', country: 'japan', day: 0 }),
    ]
    const result = applyAutoDays(attractions)
    const a1 = result.find((a) => a.id === 1)
    const a2 = result.find((a) => a.id === 2)
    expect(a2?.day).toBe(1)
    expect(a1?.day).toBe(2)
  })
  it('leaves attraction unchanged when no date', () => {
    const attractions = [
      makeAttraction({ id: 1, date: '', day: 5 }),
    ]
    expect(applyAutoDays(attractions)[0].day).toBe(5)
  })
})

describe('normalizeOrderByDate', () => {
  it('reassigns order 1,2,3 per group', () => {
    const attractions = [
      makeAttraction({ id: 1, date: '2025-03-01', country: 'japan', order: 10 }),
      makeAttraction({ id: 2, date: '2025-03-01', country: 'japan', order: 5 }),
    ]
    const result = normalizeOrderByDate(attractions)
    const orders = result.map((a) => a.order).sort((a, b) => a - b)
    expect(orders).toEqual([1, 2])
  })
})

describe('getAutoDayForDate', () => {
  it('returns 1 for empty dateKey', () => {
    expect(getAutoDayForDate([], 'japan', '')).toBe(1)
  })
  it('returns day index for date in list', () => {
    const attractions = [
      makeAttraction({ id: 1, date: '2025-03-01', country: 'japan' }),
      makeAttraction({ id: 2, date: '2025-03-03', country: 'japan' }),
    ]
    expect(getAutoDayForDate(attractions, 'japan', '2025-03-01')).toBe(1)
    expect(getAutoDayForDate(attractions, 'japan', '2025-03-03')).toBe(2)
  })
})

describe('getNextOrderForDate', () => {
  it('returns 1 when no attractions on date', () => {
    expect(getNextOrderForDate([], 'japan', '2025-03-01')).toBe(1)
  })
  it('returns max order + 1 for date', () => {
    const attractions = [
      makeAttraction({ id: 1, date: '2025-03-01', country: 'japan', order: 3 }),
    ]
    expect(getNextOrderForDate(attractions, 'japan', '2025-03-01')).toBe(4)
  })
})
