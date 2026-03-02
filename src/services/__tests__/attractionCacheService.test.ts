import { describe, it, expect } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import {
  updateAttractionCacheOnCreate,
  updateAttractionCacheOnUpdate,
  updateAttractionCacheOnDelete,
} from '../attractionCacheService'
import type { Attraction } from '@/types/Attraction'

function makeAttraction(overrides: Partial<Attraction> = {}): Attraction {
  return {
    id: 1,
    name: 'Temple',
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

describe('attractionCacheService', () => {
  it('updateAttractionCacheOnCreate appends new attraction', () => {
    const client = new QueryClient()
    client.setQueryData(['attractions'], [makeAttraction({ id: 1 })])
    updateAttractionCacheOnCreate(client, makeAttraction({ id: 2, name: 'Shrine' }))
    const data = client.getQueryData<Attraction[]>(['attractions'])
    expect(data).toHaveLength(2)
    expect(data?.map(a => a.id)).toEqual([1, 2])
  })

  it('updateAttractionCacheOnCreate sets single item when cache was empty', () => {
    const client = new QueryClient()
    updateAttractionCacheOnCreate(client, makeAttraction({ id: 1 }))
    expect(client.getQueryData(['attractions'])).toEqual([makeAttraction({ id: 1 })])
  })

  it('updateAttractionCacheOnUpdate replaces matching attraction', () => {
    const client = new QueryClient()
    const prev = makeAttraction({ id: 1, name: 'Old' })
    client.setQueryData(['attractions'], [prev])
    updateAttractionCacheOnUpdate(client, prev, makeAttraction({ id: 1, name: 'Updated' }))
    const data = client.getQueryData<Attraction[]>(['attractions'])
    expect(data?.[0].name).toBe('Updated')
  })

  it('updateAttractionCacheOnDelete removes attraction and decrements higher ids', () => {
    const client = new QueryClient()
    client.setQueryData(['attractions'], [
      makeAttraction({ id: 1 }),
      makeAttraction({ id: 2 }),
      makeAttraction({ id: 3, name: 'Third' }),
    ])
    updateAttractionCacheOnDelete(client, 2)
    const data = client.getQueryData<Attraction[]>(['attractions'])
    expect(data).toHaveLength(2)
    expect(data?.map(a => a.id).sort()).toEqual([1, 2])
    expect(data?.find(a => a.name === 'Third')?.id).toBe(2)
  })
})
