import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getNextAttractions } from '../getNextAttractions'

function makeAttraction(overrides: Partial<{ id: number; date: string }> = {}) {
  return {
    id: 1,
    name: 'A',
    country: 'japan' as const,
    city: 'Tokyo',
    date: '2025-03-01',
    type: 'temple' as const,
    visited: false,
    needsReservation: false,
    couplePrice: 0,
    currency: 'JPY' as const,
    priceInBRL: 0,
    ...overrides,
  } as import('@/types/Attraction').Attraction
}

describe('getNextAttractions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-02-15'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty array for empty attractions', () => {
    expect(getNextAttractions([])).toEqual([])
  })
  it('returns only attractions on the next date from today', () => {
    const attractions = [
      makeAttraction({ id: 1, date: '2025-03-01' }),
      makeAttraction({ id: 2, date: '2025-03-01' }),
      makeAttraction({ id: 3, date: '2025-03-05' }),
    ]
    const result = getNextAttractions(attractions)
    expect(result).toHaveLength(2)
    expect(result.map((a) => a.id)).toEqual([1, 2])
  })
  it('returns empty when all attractions are in the past', () => {
    vi.setSystemTime(new Date('2025-04-01'))
    const attractions = [
      makeAttraction({ id: 1, date: '2025-03-01' }),
    ]
    expect(getNextAttractions(attractions)).toEqual([])
  })
})
