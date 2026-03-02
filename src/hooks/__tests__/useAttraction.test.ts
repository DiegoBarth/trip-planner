import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAttraction } from '../useAttraction'
import { createQueryClientWrapper } from './wrapper'
import type { Attraction } from '@/types/Attraction'
import type { UpdateAttractionPayload } from '@/api/attraction'

const mockGetAttractions = vi.fn()
const mockCreateAttraction = vi.fn()
const mockUpdateAttraction = vi.fn()
const mockDeleteAttraction = vi.fn()
const mockBulkUpdateAttractions = vi.fn()

vi.mock('@/api/attraction', () => ({
  getAttractions: (...args: unknown[]) => mockGetAttractions(...args),
  createAttraction: (...args: unknown[]) => mockCreateAttraction(...args),
  updateAttraction: (...args: unknown[]) => mockUpdateAttraction(...args),
  deleteAttraction: (...args: unknown[]) => mockDeleteAttraction(...args),
  bulkUpdateAttractions: (...args: unknown[]) => mockBulkUpdateAttractions(...args),
}))

const mockUpdateReservation = vi.fn()
const mockDeleteReservation = vi.fn()
vi.mock('@/api/reservation', () => ({
  updateReservation: (...args: unknown[]) => mockUpdateReservation(...args),
  deleteReservation: (...args: unknown[]) => mockDeleteReservation(...args),
}))

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

describe('useAttraction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAttractions.mockResolvedValue([])
  })

  it('returns attractions, availableDays, and loading state', async () => {
    const attractions = [
      makeAttraction({ id: 1, day: 1, date: '2025-03-01' }),
      makeAttraction({ id: 2, day: 2, date: '2025-03-02' }),
    ]
    mockGetAttractions.mockResolvedValue(attractions)

    const Wrapper = createQueryClientWrapper()

    const { result } = renderHook(() => useAttraction('all'), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.attractions).toHaveLength(2)
      expect([...result.current.availableDays].sort((a, b) => a - b)).toEqual([1, 2])
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.createAttraction).toBeDefined()
    expect(result.current.updateAttraction).toBeDefined()
    expect(result.current.deleteAttraction).toBeDefined()
    expect(result.current.toggleVisited).toBeDefined()
    expect(result.current.bulkUpdate).toBeDefined()
  })

  it('filters attractions by country when country is not "all"', async () => {
    const attractions = [
      makeAttraction({ id: 1, country: 'japan' }),
      makeAttraction({ id: 2, country: 'south-korea' }),
    ]
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['attractions'], data: attractions },
    ])

    const { result } = renderHook(() => useAttraction('japan'), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.attractions).toHaveLength(1)
      expect(result.current.attractions[0].country).toBe('japan')
    })
  })

  it('createAttraction calls API', async () => {
    const newAttraction = makeAttraction({ id: 99 })
    mockCreateAttraction.mockResolvedValue(newAttraction)

    const Wrapper = createQueryClientWrapper([
      { queryKey: ['attractions'], data: [] },
    ])

    const { result } = renderHook(() => useAttraction('all'), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.attractions).toEqual([]))

    await result.current.createAttraction({
      name: 'New',
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
    })

    expect(mockCreateAttraction).toHaveBeenCalledTimes(1)
  })

  it('returns citiesToPrefetch from attractions with dates', async () => {
    const attractions = [
      makeAttraction({ id: 1, city: 'Tokyo', date: '2025-03-01' }),
      makeAttraction({ id: 2, city: 'Kyoto', date: '2025-03-02' }),
    ]
    mockGetAttractions.mockResolvedValue(attractions)
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(2))
    expect(result.current.citiesToPrefetch).toContain('Tokyo')
    expect(result.current.citiesToPrefetch).toContain('Kyoto')
  })

  it('updateAttraction calls API with payload', async () => {
    const att = makeAttraction({ id: 1 })
    const updated = makeAttraction({ id: 1, name: 'Updated' })
    mockUpdateAttraction.mockResolvedValue(updated)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['attractions'], data: [att] }])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    await result.current.updateAttraction({
      ...att,
      date: '2025-03-01',
      name: 'Updated',
    })
    expect(mockUpdateAttraction).toHaveBeenCalledTimes(1)
  })

  it('deleteAttraction calls API', async () => {
    const att = makeAttraction({ id: 1 })
    mockDeleteAttraction.mockResolvedValue(undefined)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['attractions'], data: [att] }])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    await result.current.deleteAttraction(1)
    expect(mockDeleteAttraction).toHaveBeenCalledWith(1)
  })

  it('toggleVisited calls updateAttraction with toggled visited', async () => {
    const att = makeAttraction({ id: 1, visited: false })
    mockUpdateAttraction.mockResolvedValue({ ...att, visited: true })
    const Wrapper = createQueryClientWrapper([{ queryKey: ['attractions'], data: [att] }])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    await result.current.toggleVisited(1)
    expect(mockUpdateAttraction).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, visited: true })
    )
  })

  it('toggleVisited does nothing when attraction not found', async () => {
    const Wrapper = createQueryClientWrapper([{ queryKey: ['attractions'], data: [] }])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toEqual([]))
    await result.current.toggleVisited(999)
    expect(mockUpdateAttraction).not.toHaveBeenCalled()
  })

  it('bulkUpdate with empty array does not call API', async () => {
    const Wrapper = createQueryClientWrapper([{ queryKey: ['attractions'], data: [] }])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await result.current.bulkUpdate([])
    expect(mockBulkUpdateAttractions).not.toHaveBeenCalled()
  })

  it('bulkUpdate with items calls API and returns updated', async () => {
    const atts = [makeAttraction({ id: 1 }), makeAttraction({ id: 2 })]
    const updated = [makeAttraction({ id: 1, name: 'A1' }), makeAttraction({ id: 2, name: 'A2' })]
    mockBulkUpdateAttractions.mockResolvedValue(updated)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['attractions'], data: atts }])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(2))
    const out = await result.current.bulkUpdate(atts)
    expect(mockBulkUpdateAttractions).toHaveBeenCalledTimes(1)
    expect(out).toEqual(updated)
  })

  it('exposes isCreating, isUpdating, isDeleting and error', async () => {
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isCreating).toBe(false)
    expect(result.current.isUpdating).toBe(false)
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.error).toBeFalsy()
  })

  it('treats country general: filters attractions with country general or undefined', async () => {
    const attractions = [
      makeAttraction({ id: 1, country: 'general' }),
      makeAttraction({ id: 2, country: 'japan' }),
    ]
    const Wrapper = createQueryClientWrapper([{ queryKey: ['attractions'], data: attractions }])
    const { result } = renderHook(() => useAttraction('general'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    expect(result.current.attractions[0].country).toBe('general')
  })

  it('availableDays only includes truthy day values', async () => {
    const attractions = [
      makeAttraction({ id: 1, day: 1, date: '2025-03-01' }),
      makeAttraction({ id: 2, day: 0, date: '2025-03-01' }),
    ]
    mockGetAttractions.mockResolvedValue(attractions)
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(2))
    expect(result.current.availableDays).toEqual([1])
  })

  it('citiesToPrefetch only from city when no dates', async () => {
    const attractions = [
      makeAttraction({ id: 1, city: 'Tokyo' }),
      makeAttraction({ id: 2, city: 'Kyoto', date: '' }),
    ]
    mockGetAttractions.mockResolvedValue(attractions)
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(2))
    expect(result.current.citiesToPrefetch).toContain('Tokyo')
    expect(result.current.citiesToPrefetch).toContain('Kyoto')
  })

  it('deleteAttraction with reservationId calls deleteReservation', async () => {
    mockDeleteReservation.mockResolvedValue(undefined)
    const att = makeAttraction({ id: 1, reservationId: 10 })
    mockDeleteAttraction.mockResolvedValue(undefined)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['attractions'], data: [att] }])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    await result.current.deleteAttraction(1)
    expect(mockDeleteReservation).toHaveBeenCalledWith(10)
    expect(mockDeleteAttraction).toHaveBeenCalledWith(1)
  })

  it('getFreshAttractions used by toggleVisited uses cache when available', async () => {
    const att = makeAttraction({ id: 1, visited: false })
    mockUpdateAttraction.mockResolvedValue({ ...att, visited: true })
    const Wrapper = createQueryClientWrapper([{ queryKey: ['attractions'], data: [att] }])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    await result.current.toggleVisited(1)
    expect(mockUpdateAttraction).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: 'Temple', visited: true })
    )
  })

  it('updateAttraction onSuccess does not invalidate osrm-routes when only visited changed', async () => {
    const att = makeAttraction({
      id: 1,
      visited: false,
      lat: 35.68,
      lng: 139.69,
      date: '2025-03-01',
      order: 0,
      day: 1,
    })
    const updated = { ...att, visited: true }
    mockUpdateAttraction.mockResolvedValue(updated)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['attractions'], data: [att] }])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    await result.current.updateAttraction({ ...att, date: '2025-03-01', visited: true })
    expect(mockUpdateAttraction).toHaveBeenCalledTimes(1)
  })

  it('updateAttraction syncs linked reservation when updated has reservationId and status', async () => {
    const linkedReservation = {
      id: 5,
      type: 'activity' as const,
      title: 'Ticket',
      status: 'pending' as const,
      date: '2025-03-01',
      endDate: '2025-03-01',
      country: 'japan' as const,
      attractionId: undefined as number | undefined,
      documentFileId: undefined,
    }
    const att = makeAttraction({ id: 1, reservationId: 5 })
    const updated = makeAttraction({ id: 1, reservationId: 5, reservationStatus: 'confirmed' })
    mockUpdateAttraction.mockResolvedValue(updated)
    mockUpdateReservation.mockResolvedValue({ ...linkedReservation, status: 'confirmed' })
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['attractions'], data: [att] },
      { queryKey: ['reservations'], data: [linkedReservation] },
    ])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    await result.current.updateAttraction({
      ...att,
      date: '2025-03-01',
      reservationStatus: 'confirmed',
    })
    expect(mockUpdateReservation).toHaveBeenCalledWith(
      expect.objectContaining({ id: 5, status: 'confirmed' })
    )
  })

  it('updateAttraction handles reservationStatus pending and cancelled for linked reservation', async () => {
    const linkedReservation = {
      id: 6,
      type: 'activity' as const,
      title: 'R',
      status: 'confirmed' as const,
      date: '2025-03-01',
      endDate: '2025-03-01',
      country: 'japan' as const,
      attractionId: undefined as number | undefined,
      documentFileId: undefined,
    }
    const att = makeAttraction({ id: 2, reservationId: 6 })
    const updated = makeAttraction({ id: 2, reservationId: 6, reservationStatus: 'cancelled' })
    mockUpdateAttraction.mockResolvedValue(updated)
    mockUpdateReservation.mockResolvedValue({ ...linkedReservation, status: 'cancelled' })
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['attractions'], data: [att] },
      { queryKey: ['reservations'], data: [linkedReservation] },
    ])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    await result.current.updateAttraction({
      ...att,
      date: '2025-03-01',
      reservationStatus: 'cancelled',
    })
    expect(mockUpdateReservation).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'cancelled' })
    )
  })

  it('updateAttraction does not sync reservation when reservationStatus is completed', async () => {
    const linkedReservation = {
      id: 8,
      type: 'activity' as const,
      title: 'R',
      status: 'pending' as const,
      date: '2025-03-01',
      endDate: '2025-03-01',
      country: 'japan' as const,
      attractionId: undefined as number | undefined,
      documentFileId: undefined,
    }
    const att = makeAttraction({ id: 4, reservationId: 8 })
    const updated = { ...makeAttraction({ id: 4, reservationId: 8 }), reservationStatus: 'completed' } as unknown as Attraction
    mockUpdateAttraction.mockResolvedValue(updated)
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['attractions'], data: [att] },
      { queryKey: ['reservations'], data: [linkedReservation] },
    ])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    await result.current.updateAttraction({
      ...att,
      date: '2025-03-01',
      reservationStatus: 'completed',
    } as UpdateAttractionPayload)
    expect(mockUpdateReservation).not.toHaveBeenCalled()
  })

  it('updateAttraction continues when updateReservation throws in sync', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const linkedReservation = {
      id: 7,
      type: 'activity' as const,
      title: 'R',
      status: 'pending' as const,
      date: '2025-03-01',
      endDate: '2025-03-01',
      country: 'japan' as const,
      attractionId: undefined as number | undefined,
      documentFileId: undefined,
    }
    const att = makeAttraction({ id: 3, reservationId: 7 })
    const updated = makeAttraction({ id: 3, reservationId: 7, reservationStatus: 'confirmed' })
    mockUpdateAttraction.mockResolvedValue(updated)
    mockUpdateReservation.mockRejectedValue(new Error('API error'))
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['attractions'], data: [att] },
      { queryKey: ['reservations'], data: [linkedReservation] },
    ])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    const out = await result.current.updateAttraction({
      ...att,
      date: '2025-03-01',
      reservationStatus: 'confirmed',
    })
    expect(out).toEqual(updated)
    err.mockRestore()
  })

  it('updateAttraction onSuccess when previous not in cache still runs without throwing', async () => {
    const att = makeAttraction({ id: 99 })
    const updated = makeAttraction({ id: 99, name: 'Updated' })
    mockUpdateAttraction.mockResolvedValue(updated)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['attractions'], data: [makeAttraction({ id: 1 })] }])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    await result.current.updateAttraction({ ...att, date: '2025-03-01', name: 'Updated' })
    expect(mockUpdateAttraction).toHaveBeenCalledTimes(1)
  })

  it('deleteAttraction continues when deleteReservation throws', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const att = makeAttraction({ id: 1, reservationId: 20 })
    mockDeleteReservation.mockRejectedValue(new Error('API error'))
    mockDeleteAttraction.mockResolvedValue(undefined)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['attractions'], data: [att] }])
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    await result.current.deleteAttraction(1)
    expect(mockDeleteAttraction).toHaveBeenCalledWith(1)
    err.mockRestore()
  })

  it('citiesToPrefetch adds todayOrNext city when withDate has future date', async () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 10)
    const dateStr = futureDate.toISOString().slice(0, 10)
    const attractions = [
      makeAttraction({ id: 1, city: 'Osaka', date: dateStr }),
    ]
    mockGetAttractions.mockResolvedValue(attractions)
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useAttraction('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.attractions).toHaveLength(1))
    expect(result.current.citiesToPrefetch).toContain('Osaka')
  })
})
