import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { getAccommodations } from '@/api/accommodation'
import { apiGet } from '@/api/client'
import type { Accommodation } from '@/types/Accommodation'

vi.mock('@/api/client', () => ({
  apiGet: vi.fn()
}))

describe('getAccommodations', () => {
  const mockData: Accommodation[] = [
    {
      id: 1,
      description: 'Hotel confortável no centro da cidade',
      city: 'São Paulo',
      country: 'Brasil',
      address: 'Rua das Flores, 123',
      lat: -23.55052,
      lng: -46.633308
    },
    {
      id: 2,
      description: 'Pousada tranquila próxima à praia',
      city: 'Florianópolis',
      country: 'Brasil',
      address: 'Av. Beira Mar, 456',
      lat: -27.5949,
      lng: -48.5480
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return accommodations when API call is successful', async () => {
    ; (apiGet as Mock).mockResolvedValue({
      success: true,
      data: mockData
    })

    const result = await getAccommodations()
    expect(result).toEqual(mockData)
    expect(apiGet).toHaveBeenCalledWith({ action: 'getAccommodations' })
  })

  it('should throw an error when API call fails', async () => {
    ; (apiGet as Mock).mockResolvedValue({
      success: false,
      message: 'API error'
    })

    await expect(getAccommodations()).rejects.toThrow('API error')
  })

  it('should throw a default error when data is missing', async () => {
    ; (apiGet as Mock).mockResolvedValue({
      success: true
      // data undefined
    })

    await expect(getAccommodations()).rejects.toThrow('Failed to fetch accommodations')
  })

  it('should throw an error if apiGet rejects (network error)', async () => {
    ; (apiGet as Mock).mockRejectedValue(new Error('Network error'))

    await expect(getAccommodations()).rejects.toThrow('Network error')
  })
})