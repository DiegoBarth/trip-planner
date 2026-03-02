import { describe, it, expect } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import {
  updateReservationCacheOnCreate,
  updateReservationCacheOnUpdate,
  updateReservationCacheOnDelete,
} from '../reservationCacheService'
import type { Reservation } from '@/types/Reservation'

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: 1,
    type: 'activity',
    title: 'Ticket',
    status: 'pending',
    date: '2025-03-01',
    endDate: '2025-03-01',
    country: 'japan',
    ...overrides,
  }
}

describe('reservationCacheService', () => {
  it('updateReservationCacheOnCreate appends new reservation', () => {
    const client = new QueryClient()
    client.setQueryData(['reservations'], [makeReservation({ id: 1 })])
    updateReservationCacheOnCreate(client, makeReservation({ id: 2, title: 'Hotel' }))
    const data = client.getQueryData<Reservation[]>(['reservations'])
    expect(data).toHaveLength(2)
    expect(data?.map(r => r.id)).toEqual([1, 2])
  })

  it('updateReservationCacheOnCreate sets single item when cache was empty', () => {
    const client = new QueryClient()
    updateReservationCacheOnCreate(client, makeReservation({ id: 1 }))
    expect(client.getQueryData(['reservations'])).toEqual([makeReservation({ id: 1 })])
  })

  it('updateReservationCacheOnUpdate replaces matching reservation', () => {
    const client = new QueryClient()
    const prev = makeReservation({ id: 1, status: 'pending' })
    client.setQueryData(['reservations'], [prev])
    updateReservationCacheOnUpdate(client, makeReservation({ id: 1, status: 'confirmed' }))
    const data = client.getQueryData<Reservation[]>(['reservations'])
    expect(data?.[0].status).toBe('confirmed')
  })

  it('updateReservationCacheOnDelete removes reservation and decrements higher ids', () => {
    const client = new QueryClient()
    client.setQueryData(['reservations'], [
      makeReservation({ id: 1 }),
      makeReservation({ id: 2 }),
      makeReservation({ id: 3, title: 'Third' }),
    ])
    updateReservationCacheOnDelete(client, 2)
    const data = client.getQueryData<Reservation[]>(['reservations'])
    expect(data).toHaveLength(2)
    expect(data?.map(r => r.id).sort()).toEqual([1, 2])
    expect(data?.find(r => r.title === 'Third')?.id).toBe(2)
  })
})
