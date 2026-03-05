import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as clientModule from '@/api/client'
import {
  createReservation,
  updateReservation,
  deleteReservation,
  getReservations,
  uploadFile,
  deleteFile
} from '@/api/reservation'
import { normalizeTimeFromSheets } from '@/utils/formatters'

describe('Reservation API', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('createReservation', () => {
    it('returns reservation with normalized time', async () => {
      const apiResponse = { success: true, data: { id: 1, type: 'flight', title: 'Test', status: 'pending', time: '10:00' } }
      vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce(apiResponse)

      const result = await createReservation({ type: 'flight', title: 'Test', status: 'pending' })
      expect(result.id).toBe(1)
      expect(result.time).toBe(normalizeTimeFromSheets('10:00'))
    })
  })

  describe('updateReservation', () => {
    it('returns updated reservation with normalized time', async () => {
      const apiResponse = { success: true, data: { id: 2, type: 'hotel', title: 'Stay', status: 'confirmed', time: '14:00' } }
      vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce(apiResponse)

      const result = await updateReservation({ id: 2, type: 'hotel', title: 'Stay', status: 'confirmed', amount: 0 } as any)
      expect(result.id).toBe(2)
      expect(result.time).toBe(normalizeTimeFromSheets('14:00'))
    })
  })

  describe('deleteReservation', () => {
    it('resolves successfully when API returns success', async () => {
      vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: true, data: null })
      await expect(deleteReservation(1)).resolves.toBeUndefined()
    })
  })

  describe('getReservations', () => {
    it('returns parsed reservations with normalized time', async () => {
      const data = [{ id: 1, type: 'flight', title: 'Trip', status: 'pending', time: '08:00' }]
      vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce({ success: true, data })

      const result = await getReservations()
      expect(result[0].time).toBe(normalizeTimeFromSheets('08:00'))
    })

    it('returns empty array if API returns success=false', async () => {
      vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce({ success: false })
      const result = await getReservations()
      expect(result).toEqual([])
    })

    it('returns empty array if API returns no data', async () => {
      vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce({ success: true })
      const result = await getReservations()
      expect(result).toEqual([])
    })

    it('getReservations handles undefined time correctly', async () => {
      const data = [{ id: 1, type: 'flight', title: 'Trip', status: 'pending' }]
      vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce({ success: true, data })
      const result = await getReservations()
      expect(result[0].time).toBeUndefined()
    })
  })

  describe('uploadFile', () => {
    it('returns file info if API succeeds', async () => {
      const apiResponse = { success: true, data: { fileUrl: 'url', fileName: 'file.txt', fileId: '123' } }
      vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce(apiResponse)

      const result = await uploadFile('file.txt', 'data', 'text/plain')
      expect(result.fileUrl).toBe('url')
    })
  })

  describe('deleteFile', () => {
    it('resolves successfully if API returns success', async () => {
      vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: true, data: null })
      await expect(deleteFile('123')).resolves.toBeUndefined()
    })
  })
})

describe('Reservation API - error handling', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('createReservation throws error when success=false', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false, message: 'Create failed' })
    await expect(createReservation({ type: 'flight', title: 'Test', status: 'pending' })).rejects.toThrow('Create failed')
  })

  it('createReservation returns undefined time if response.data.time is missing', async () => {
    const apiResponse = { success: true, data: { id: 1, type: 'flight', title: 'Test', status: 'pending' } }
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce(apiResponse)
    const result = await createReservation({ type: 'flight', title: 'Test', status: 'pending' })
    expect(result.time).toBeUndefined()
  })

  it('updateReservation throws error when success=false', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false, message: 'Update failed' })
    await expect(updateReservation({ id: 1, type: 'flight', title: 'Test', status: 'pending' } as any)).rejects.toThrow('Update failed')
  })

  it('deleteReservation throws error when success=false', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false, message: 'Delete failed' })
    await expect(deleteReservation(1)).rejects.toThrow('Delete failed')
  })

  it('uploadFile throws error when success=false', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false, message: 'Upload failed' })
    await expect(uploadFile('file.txt', 'data', 'text/plain')).rejects.toThrow('Upload failed')
  })

  it('deleteFile throws error when success=false', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false, message: 'Delete file failed' })
    await expect(deleteFile('123')).rejects.toThrow('Delete file failed')
  })
})

describe('Reservation API - edge cases', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('createReservation throws error if data is missing even when success=true', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: true })
    await expect(createReservation({ type: 'flight', title: 'Test', status: 'pending' })).rejects.toThrow(
      'Failed to create reservation'
    )
  })

  it('updateReservation returns undefined time if response.data.time is missing', async () => {
    const apiResponse = { success: true, data: { id: 2, type: 'hotel', title: 'Stay', status: 'confirmed' } }
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce(apiResponse)
    const result = await updateReservation({ id: 2, type: 'hotel', title: 'Stay', status: 'confirmed' } as any)
    expect(result.time).toBeUndefined()
  })

  it('updateReservation throws error if data is missing even when success=true', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: true })
    await expect(updateReservation({ id: 1, type: 'flight', title: 'Test', status: 'pending' } as any)).rejects.toThrow(
      'Failed to update reservation'
    )
  })

  it('deleteReservation throws default error when message is undefined', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false })
    await expect(deleteReservation(1)).rejects.toThrow('Failed to delete reservation')
  })

  it('uploadFile returns empty object if data is undefined', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: true })
    const result = await uploadFile('file.txt', 'data', 'text/plain')
    expect(result).toEqual({})
  })

  it('uploadFile throws default error when message is undefined', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false })
    await expect(uploadFile('file.txt', 'data', 'text/plain')).rejects.toThrow('Failed to upload file')
  })

  it('deleteFile throws default error when message is undefined', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false })
    await expect(deleteFile('123')).rejects.toThrow('Failed to delete file')
  })
})