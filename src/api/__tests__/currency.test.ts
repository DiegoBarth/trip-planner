import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getExchangeRates } from '@/api/currency'
import * as clientModule from '@/api/client'
import type { CurrencyRates } from '@/types/Currency'

describe('getExchangeRates', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('returns data when apiGet succeeds', async () => {
    const mockData: CurrencyRates = { JPY_BRL: 50, KRW_BRL: 0.035, BRL_BRL: 1 }
    const mockResponse = { success: true, data: mockData }

    vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce(mockResponse)

    const result = await getExchangeRates()
    expect(result).toEqual(mockData)
  })

  it('throws error when apiGet returns success: false', async () => {
    const mockResponse = { success: false, message: 'API failure' }
    vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce(mockResponse)

    await expect(getExchangeRates()).rejects.toThrow('API failure')
  })

  it('throws generic error when apiGet returns no data', async () => {
    const mockResponse = { success: true }
    vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce(mockResponse)

    await expect(getExchangeRates()).rejects.toThrow('Failed to fetch exchange rates')
  })

  it('propagates apiGet errors', async () => {
    vi.spyOn(clientModule, 'apiGet').mockRejectedValueOnce(new Error('Network error'))

    await expect(getExchangeRates()).rejects.toThrow('Network error')
  })
})