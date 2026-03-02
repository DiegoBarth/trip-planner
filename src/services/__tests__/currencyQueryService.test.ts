import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exchangeRatesQueryKey, getExchangeRatesQueryOptions } from '../currencyQueryService'

const mockGetExchangeRates = vi.fn()
vi.mock('@/api/currency', () => ({
  getExchangeRates: (...args: unknown[]) => mockGetExchangeRates(...args),
}))

describe('currencyQueryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exchangeRatesQueryKey returns stable key', () => {
    expect(exchangeRatesQueryKey()).toEqual(['exchangeRates'])
  })

  it('getExchangeRatesQueryOptions returns queryKey, queryFn, staleTime, retry', () => {
    const options = getExchangeRatesQueryOptions()
    expect(options.queryKey).toEqual(['exchangeRates'])
    expect(options.queryFn).toBeDefined()
    expect(typeof options.staleTime).toBe('number')
    expect(options.retry).toBe(1)
  })

  it('queryFn calls getExchangeRates', async () => {
    mockGetExchangeRates.mockResolvedValue({ JPY_BRL: 0.03 })
    const options = getExchangeRatesQueryOptions()
    await options.queryFn()
    expect(mockGetExchangeRates).toHaveBeenCalledTimes(1)
  })
})
