import { getExchangeRates } from '@/api/currency';
import { QUERY_STALE_TIME_MS } from '@/config/constants';

export const exchangeRatesQueryKey = () => ['exchangeRates'] as const;

export const getExchangeRatesQueryOptions = () => ({
  queryKey: exchangeRatesQueryKey(),
  queryFn: getExchangeRates,
  staleTime: QUERY_STALE_TIME_MS,
  retry: 1
});