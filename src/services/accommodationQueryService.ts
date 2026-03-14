import { getAccommodations } from '@/api/accommodation';
import { OFFLINE_STALE_TIME_MS } from '@/config/constants';

export const accommodationsQueryKey = () => ['accommodations'] as const;

export const getAccommodationsQueryOptions = () => ({
  queryKey: accommodationsQueryKey(),
  queryFn: getAccommodations,
  staleTime: OFFLINE_STALE_TIME_MS,
  retry: 1
});