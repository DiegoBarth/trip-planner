import { useQuery } from '@tanstack/react-query'
import { getExchangeRatesQueryOptions } from '@/services/currencyQueryService';
import type { CurrencyRates } from '@/types/Currency'

export function useCurrency() {
  const { data, isLoading, error } = useQuery<CurrencyRates>(getExchangeRatesQueryOptions());

  return {
    rates: data ?? null,
    isLoading,
    error
  }
}