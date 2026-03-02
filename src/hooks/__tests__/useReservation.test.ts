import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useReservation } from '../useReservation'
import { createQueryClientWrapper } from './wrapper'
import type { Reservation } from '@/types/Reservation'

const mockGetReservations = vi.fn()
const mockCreateReservation = vi.fn()
const mockUpdateReservation = vi.fn()
const mockDeleteReservation = vi.fn()
const mockDeleteFile = vi.fn()

vi.mock('@/api/reservation', () => ({
  getReservations: (...args: unknown[]) => mockGetReservations(...args),
  createReservation: (...args: unknown[]) => mockCreateReservation(...args),
  updateReservation: (...args: unknown[]) => mockUpdateReservation(...args),
  deleteReservation: (...args: unknown[]) => mockDeleteReservation(...args),
  deleteFile: (...args: unknown[]) => mockDeleteFile(...args),
}))

const mockUpdateAttraction = vi.fn()
const mockDeleteAttraction = vi.fn()
vi.mock('@/api/attraction', () => ({
  updateAttraction: (...args: unknown[]) => mockUpdateAttraction(...args),
  deleteAttraction: (...args: unknown[]) => mockDeleteAttraction(...args),
}))

function makeReservation(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: 1,
    type: 'accommodation',
    title: 'Hotel',
    status: 'pending',
    date: '2025-03-01',
    endDate: '2025-03-05',
    country: 'japan',
    attractionId: undefined,
    documentFileId: undefined,
    ...overrides,
  }
}

describe('useReservation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetReservations.mockResolvedValue([])
    mockDeleteFile.mockResolvedValue(undefined)
  })

  it('returns reservations and loading state', async () => {
    const reservations = [
      makeReservation({ id: 1 }),
      makeReservation({ id: 2 }),
    ]
    mockGetReservations.mockResolvedValue(reservations)

    const Wrapper = createQueryClientWrapper([
      { queryKey: ['reservations'], data: reservations },
    ])

    const { result } = renderHook(() => useReservation(), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.reservations).toHaveLength(2)
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.createReservation).toBeDefined()
    expect(result.current.updateReservation).toBeDefined()
    expect(result.current.deleteReservation).toBeDefined()
  })

  it('createReservation calls API', async () => {
    const newReservation = makeReservation({ id: 99 })
    mockCreateReservation.mockResolvedValue(newReservation)

    const Wrapper = createQueryClientWrapper([
      { queryKey: ['reservations'], data: [] },
    ])

    const { result } = renderHook(() => useReservation(), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.reservations).toEqual([]))

    await result.current.createReservation({
      type: 'accommodation',
      title: 'Hotel',
      status: 'pending',
      date: '2025-03-01',
      endDate: '2025-03-05',
      country: 'japan',
    })

    expect(mockCreateReservation).toHaveBeenCalledTimes(1)
  })

  it('updateReservation calls API', async () => {
    const res = makeReservation({ id: 1 })
    const updated = makeReservation({ id: 1, title: 'Updated' })
    mockUpdateReservation.mockResolvedValue(updated)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['reservations'], data: [res] }])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    await result.current.updateReservation({
      ...res,
      id: 1,
      title: 'Updated',
    })
    expect(mockUpdateReservation).toHaveBeenCalledTimes(1)
  })

  it('deleteReservation calls API', async () => {
    const res = makeReservation({ id: 1 })
    mockDeleteReservation.mockResolvedValue(undefined)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['reservations'], data: [res] }])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    await result.current.deleteReservation(1)
    expect(mockDeleteReservation).toHaveBeenCalledWith(1)
  })

  it('exposes isCreating, isUpdating, isDeleting and error', async () => {
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isCreating).toBe(false)
    expect(result.current.isUpdating).toBe(false)
    expect(result.current.isDeleting).toBe(false)
    expect(result.current).toHaveProperty('error')
  })

  it('updateReservation calls deleteFile when documentFileId changed', async () => {
    const res = makeReservation({ id: 1, documentFileId: 'old-file-id' })
    const updated = makeReservation({ id: 1, documentFileId: 'new-file-id' })
    mockDeleteFile.mockResolvedValue(undefined)
    mockUpdateReservation.mockResolvedValue(updated)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['reservations'], data: [res] }])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    await result.current.updateReservation({
      ...res,
      id: 1,
      documentFileId: 'new-file-id',
    })
    expect(mockDeleteFile).toHaveBeenCalledWith('old-file-id')
    expect(mockUpdateReservation).toHaveBeenCalledTimes(1)
  })

  it('updateReservation continues when deleteFile throws', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = makeReservation({ id: 1, documentFileId: 'old-id' })
    const updated = makeReservation({ id: 1 })
    mockDeleteFile.mockRejectedValue(new Error('Drive error'))
    mockUpdateReservation.mockResolvedValue(updated)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['reservations'], data: [res] }])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    await result.current.updateReservation({ ...res, id: 1, documentFileId: 'new-id' })
    expect(mockUpdateReservation).toHaveBeenCalledTimes(1)
    err.mockRestore()
  })

  it('updateReservation syncs linked attraction when updated has attractionId and status', async () => {
    const att = {
      id: 10,
      name: 'A',
      country: 'japan' as const,
      city: 'Tokyo',
      day: 1,
      date: '2025-03-01',
      dayOfWeek: 'Mon',
      type: 'temple' as const,
      order: 0,
      couplePrice: 0,
      currency: 'JPY' as const,
      priceInBRL: 0,
      visited: false,
      needsReservation: false,
    }
    const res = makeReservation({ id: 1, attractionId: 10 })
    const updated = makeReservation({ id: 1, attractionId: 10, status: 'confirmed' })
    mockUpdateReservation.mockResolvedValue(updated)
    mockUpdateAttraction.mockResolvedValue({})
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['reservations'], data: [res] },
      { queryKey: ['attractions', 'japan'], data: [att] },
    ])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    await result.current.updateReservation({ ...res, id: 1, status: 'confirmed' })
    expect(mockUpdateAttraction).toHaveBeenCalledWith(
      expect.objectContaining({ id: 10, reservationStatus: 'confirmed' })
    )
  })

  it('updateReservation handles status pending for linked attraction', async () => {
    const att = {
      id: 20,
      name: 'B',
      country: 'south-korea' as const,
      city: 'Seoul',
      day: 1,
      date: '2025-03-01',
      dayOfWeek: 'Mon',
      type: 'museum' as const,
      order: 0,
      couplePrice: 0,
      currency: 'KRW' as const,
      priceInBRL: 0,
      visited: false,
      needsReservation: false,
    }
    const res = makeReservation({ id: 2, attractionId: 20 })
    mockUpdateReservation.mockResolvedValue({ ...res, id: 2, attractionId: 20, status: 'pending' })
    mockUpdateAttraction.mockResolvedValue({})
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['reservations'], data: [res] },
      { queryKey: ['attractions', 'south-korea'], data: [att] },
    ])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    await result.current.updateReservation({ ...res, id: 2, status: 'pending' })
    expect(mockUpdateAttraction).toHaveBeenCalledWith(
      expect.objectContaining({ reservationStatus: 'pending' })
    )
  })

  it('updateReservation handles status cancelled for linked attraction', async () => {
    const att = {
      id: 30,
      name: 'C',
      country: 'japan' as const,
      city: 'Kyoto',
      day: 1,
      date: '2025-03-01',
      dayOfWeek: 'Mon',
      type: 'temple' as const,
      order: 0,
      couplePrice: 0,
      currency: 'JPY' as const,
      priceInBRL: 0,
      visited: false,
      needsReservation: false,
    }
    const res = makeReservation({ id: 3, attractionId: 30 })
    const updated = makeReservation({ id: 3, attractionId: 30, status: 'cancelled' })
    mockUpdateReservation.mockResolvedValue(updated)
    mockUpdateAttraction.mockResolvedValue({})
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['reservations'], data: [res] },
      { queryKey: ['attractions', 'japan'], data: [att] },
    ])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    await result.current.updateReservation({ ...res, id: 3, status: 'cancelled' })
    expect(mockUpdateAttraction).toHaveBeenCalledWith(
      expect.objectContaining({ id: 30, reservationStatus: 'cancelled' })
    )
  })

  it('updateReservation continues when updateAttraction throws during sync', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const att = {
      id: 40,
      name: 'D',
      country: 'japan' as const,
      city: 'Tokyo',
      day: 1,
      date: '2025-03-01',
      dayOfWeek: 'Mon',
      type: 'temple' as const,
      order: 0,
      couplePrice: 0,
      currency: 'JPY' as const,
      priceInBRL: 0,
      visited: false,
      needsReservation: false,
    }
    const res = makeReservation({ id: 4, attractionId: 40 })
    const updated = makeReservation({ id: 4, attractionId: 40, status: 'confirmed' })
    mockUpdateReservation.mockResolvedValue(updated)
    mockUpdateAttraction.mockRejectedValue(new Error('Attraction API error'))
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['reservations'], data: [res] },
      { queryKey: ['attractions', 'japan'], data: [att] },
    ])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    const out = await result.current.updateReservation({ ...res, id: 4, status: 'confirmed' })
    expect(out).toEqual(updated)
    err.mockRestore()
  })

  it('deleteReservation calls deleteFile when reservation has documentFileId', async () => {
    const res = makeReservation({ id: 1, documentFileId: 'file-123' })
    mockDeleteFile.mockResolvedValue(undefined)
    mockDeleteReservation.mockResolvedValue(undefined)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['reservations'], data: [res] }])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    await result.current.deleteReservation(1)
    expect(mockDeleteFile).toHaveBeenCalledWith('file-123')
    expect(mockDeleteReservation).toHaveBeenCalledWith(1)
  })

  it('deleteReservation continues when deleteFile throws', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = makeReservation({ id: 1, documentFileId: 'file-1' })
    mockDeleteFile.mockRejectedValue(new Error('Drive error'))
    mockDeleteReservation.mockResolvedValue(undefined)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['reservations'], data: [res] }])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    await result.current.deleteReservation(1)
    expect(mockDeleteReservation).toHaveBeenCalledWith(1)
    err.mockRestore()
  })

  it('deleteReservation calls deleteAttraction and cache when reservation has attractionId', async () => {
    const res = makeReservation({ id: 1, attractionId: 99 })
    mockDeleteAttraction.mockResolvedValue(undefined)
    mockDeleteReservation.mockResolvedValue(undefined)
    const att = { id: 99, name: 'X', country: 'japan' as const, city: 'T', day: 1, date: '2025-03-01', dayOfWeek: 'Mon', type: 'temple' as const, order: 0, couplePrice: 0, currency: 'JPY' as const, priceInBRL: 0, visited: false, needsReservation: false }
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['reservations'], data: [res] },
      { queryKey: ['attractions', 'japan'], data: [att] },
    ])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    await result.current.deleteReservation(1)
    expect(mockDeleteAttraction).toHaveBeenCalledWith(99)
    expect(mockDeleteReservation).toHaveBeenCalledWith(1)
  })

  it('deleteReservation continues when deleteAttraction throws', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = makeReservation({ id: 1, attractionId: 88 })
    mockDeleteAttraction.mockRejectedValue(new Error('API error'))
    mockDeleteReservation.mockResolvedValue(undefined)
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['reservations'], data: [res] },
      { queryKey: ['attractions', 'general'], data: [{ id: 88, country: 'general' }] },
    ])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    await result.current.deleteReservation(1)
    expect(mockDeleteReservation).toHaveBeenCalledWith(1)
    err.mockRestore()
  })

  it('updateReservation does not call deleteFile when documentFileId unchanged', async () => {
    const res = makeReservation({ id: 1, documentFileId: 'same-id' })
    const updated = makeReservation({ id: 1, documentFileId: 'same-id' })
    mockUpdateReservation.mockResolvedValue(updated)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['reservations'], data: [res] }])
    const { result } = renderHook(() => useReservation(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.reservations).toHaveLength(1))
    await result.current.updateReservation({ ...res, id: 1, documentFileId: 'same-id' })
    expect(mockDeleteFile).not.toHaveBeenCalled()
  })
})
