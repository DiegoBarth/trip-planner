import { useQuery } from '@tanstack/react-query'
import { getExchangeRates } from '@/api/currency'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type { CurrencyRates } from '@/types/Currency'

export function useCurrency() {
  const { data, isLoading, error } = useQuery<CurrencyRates>({
    queryKey: ['exchangeRates'],
    queryFn: getExchangeRates,
    staleTime: QUERY_STALE_TIME_MS
  });

  return {
    rates: data ?? null,
    isLoading,
    error
  }
}