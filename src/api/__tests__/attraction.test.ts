import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import {
  createAttraction,
  updateAttraction,
  deleteAttraction,
  getAttractions,
  bulkUpdateAttractions,
  type CreateAttractionPayload,
  type UpdateAttractionPayload
} from '@/api/attraction'
import { apiGet, apiPost } from '@/api/client'
import type { Attraction } from '@/types/Attraction'
import { parseAttractions } from '@/api/schemas'

vi.mock('@/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn()
}))

vi.mock('@/api/schemas', () => ({
  parseAttractions: vi.fn((data) => data)
}))

const mockAttraction: Attraction = {
  id: 1,
  name: 'Templo Senso-Ji',
  country: 'japan',
  city: 'Tokyo',
  region: 'Asakusa',
  day: 1,
  date: '2026-03-05',
  dayOfWeek: 'Thursday',
  type: 'museum',
  order: 1,
  visited: false,
  needsReservation: true,
  reservationStatus: 'pending',
  couplePrice: 100,
  currency: 'BRL',
  priceInBRL: 100,
  idealPeriod: 'morning',
  isOpen: true,
  openingTime: '09:00',
  closingTime: '17:00',
  closedDays: 'Sunday',
  ticketLink: 'https://example.com',
  location: 'test Street, 123',
  duration: 120,
  notes: 'Bring ID',
  imageUrl: 'https://example.com/image.png',
  reservationId: 42
}

describe('Attractions API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===== createAttraction =====
  it('createAttraction should return attraction on success', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true, data: mockAttraction })

    const payload: CreateAttractionPayload = { ...mockAttraction }
    const result = await createAttraction(payload)
    expect(result).toEqual(mockAttraction)
    expect(apiPost).toHaveBeenCalledWith({ action: 'createAttraction', data: payload })
  })

  it('createAttraction should throw error on failure', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false, message: 'Failed' })

    const payload: CreateAttractionPayload = { ...mockAttraction }
    await expect(createAttraction(payload)).rejects.toThrow('Failed')
  })

  // ===== updateAttraction =====
  it('updateAttraction should return updated attraction', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true, data: mockAttraction })

    const payload: UpdateAttractionPayload = mockAttraction
    const result = await updateAttraction(payload)
    expect(result).toEqual(mockAttraction)
    expect(apiPost).toHaveBeenCalledWith({ action: 'updateAttraction', data: payload })
  })

  it('updateAttraction should throw error if fails', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false, message: 'Error' })

    const payload: UpdateAttractionPayload = mockAttraction
    await expect(updateAttraction(payload)).rejects.toThrow('Error')
  })

  // ===== deleteAttraction =====
  it('deleteAttraction should succeed if API returns success', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true })
    await expect(deleteAttraction(1)).resolves.toBeUndefined()
    expect(apiPost).toHaveBeenCalledWith({ action: 'deleteAttraction', id: 1 })
  })

  it('deleteAttraction should throw error if API fails', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false, message: 'Cannot delete' })
    await expect(deleteAttraction(1)).rejects.toThrow('Cannot delete')
  })

  // ===== getAttractions =====
  it('getAttractions should return parsed attractions', async () => {
    ; (apiGet as Mock).mockResolvedValue({ success: true, data: [mockAttraction] })

    const result = await getAttractions()
    expect(parseAttractions).toHaveBeenCalledWith([mockAttraction])
    expect(result).toEqual([mockAttraction])
  })

  it('getAttractions should return empty array if API fails', async () => {
    ; (apiGet as Mock).mockResolvedValue({ success: false })
    const result = await getAttractions()
    expect(result).toEqual([])
  })

  // ===== bulkUpdateAttractions =====
  it('bulkUpdateAttractions should return updated attractions', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true, data: [mockAttraction] })
    const payload: UpdateAttractionPayload[] = [mockAttraction]

    const result = await bulkUpdateAttractions(payload)
    expect(result).toEqual([mockAttraction])
    expect(apiPost).toHaveBeenCalledWith({ action: 'bulkUpdateAttractions', data: payload })
  })

  it('bulkUpdateAttractions should throw error on failure', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false, message: 'Bulk update failed' })
    const payload: UpdateAttractionPayload[] = [mockAttraction]

    await expect(bulkUpdateAttractions(payload)).rejects.toThrow('Bulk update failed')
  })
})

describe('Attractions API - Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===== createAttraction =====
  it('should throw default error if createAttraction returns success false', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false })

    const payload: CreateAttractionPayload = { ...mockAttraction }
    await expect(createAttraction(payload)).rejects.toThrow('Failed to create attraction')
  })

  // ===== updateAttraction =====
  it('should throw default error if updateAttraction returns success false', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false })

    const payload: UpdateAttractionPayload = mockAttraction
    await expect(updateAttraction(payload)).rejects.toThrow('Failed to update attraction')
  })

  it('should throw default error if updateAttraction returns success true but no data', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true })
    const payload: UpdateAttractionPayload = mockAttraction
    await expect(updateAttraction(payload)).rejects.toThrow('Failed to update attraction')
  })

  // ===== deleteAttraction =====
  it('should throw default error if deleteAttraction returns success false', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false })
    await expect(deleteAttraction(1)).rejects.toThrow('Failed to delete attraction')
  })

  // ===== bulkUpdateAttractions =====
  it('should throw default error if bulkUpdateAttractions returns success false', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false })
    const payload: UpdateAttractionPayload[] = [mockAttraction]
    await expect(bulkUpdateAttractions(payload)).rejects.toThrow('Failed to bulk update attractions')
  })

  it('should throw default error if bulkUpdateAttractions returns success true but no data', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true })
    const payload: UpdateAttractionPayload[] = [mockAttraction]
    await expect(bulkUpdateAttractions(payload)).rejects.toThrow('Failed to bulk update attractions')
  })
})