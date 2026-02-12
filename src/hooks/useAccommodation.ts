import { useQuery } from '@tanstack/react-query'
import { getAccommodations } from '@/api/accommodation'
import { QUERY_STALE_TIME_MS } from '@/config/constants'

export function useAccommodation() {
   const { data: accommodations = [], isLoading, error } = useQuery({
      queryKey: ['accommodations'],
      queryFn: getAccommodations,
      staleTime: QUERY_STALE_TIME_MS,
   })

   return {
      accommodations,
      isLoading,
      error
   }
}