import { useQuery } from '@tanstack/react-query'
import { getAccommodationsQueryOptions } from '@/services/accommodationQueryService';

export function useAccommodation() {
  const { data: accommodations = [], isLoading, error } = useQuery(getAccommodationsQueryOptions());

  return {
    accommodations,
    isLoading,
    error
  }
}