import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCurrency } from '../useCurrency'
import { createQueryClientWrapper } from './wrapper'

const mockQueryFn = vi.fn()

vi.mock('@/services/currencyQueryService', () => ({
  getExchangeRatesQueryOptions: () => ({
    queryKey: ['exchange_rates'],
    queryFn: mockQueryFn,
    staleTime: 300000,
  }),
}))

describe('useCurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryFn.mockResolvedValue({
      JPY: 0.032,
      KRW: 0.0037,
      BRL: 1,
    })
  })

  it('returns rates, isLoading and error', async () => {
    const Wrapper = createQueryClientWrapper()

    const { result } = renderHook(() => useCurrency(), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.rates).toEqual({ JPY: 0.032, KRW: 0.0037, BRL: 1 })
    })
  })

  it('returns null rates when query has no data yet', () => {
    mockQueryFn.mockImplementation(() => new Promise(() => {}))
    const Wrapper = createQueryClientWrapper()

    const { result } = renderHook(() => useCurrency(), {
      wrapper: Wrapper,
    })

    expect(result.current.rates).toBeNull()
  })
})
