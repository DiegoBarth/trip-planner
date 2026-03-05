import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as clientModule from '@/api/client'
import { searchLocations, type LocationResult } from '@/api/location'

describe('searchLocations', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns locations when apiGet succeeds', async () => {
    const mockData: LocationResult[] = [
      { displayName: 'Tokyo, Japan', lat: '35.6895', lon: '139.6917' }
    ]
    vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce({ success: true, data: mockData })

    const result = await searchLocations('Tokyo', 'Tokyo', 'Japan')
    expect(clientModule.apiGet).toHaveBeenCalledWith({
      action: 'searchLocations',
      q: 'Tokyo, Tokyo, Japan'
    })
    expect(result).toEqual(mockData)
  })

  it('returns empty array if name is empty', async () => {
    const result = await searchLocations('')
    expect(result).toEqual([])
  })

  it('throws error if API returns success=false', async () => {
    vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce({ success: false, message: 'API error' })

    await expect(searchLocations('Seoul')).rejects.toThrow('API error')
  })

  it('throws error if API returns success=true but no data', async () => {
    vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce({ success: true })

    await expect(searchLocations('Seoul')).rejects.toThrow('Failed to fetch locations')
  })

  it('propagates apiGet errors', async () => {
    vi.spyOn(clientModule, 'apiGet').mockRejectedValueOnce(new Error('Network failure'))

    await expect(searchLocations('Paris')).rejects.toThrow('Network failure')
  })
})