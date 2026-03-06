import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAccommodationsQueryOptions } from '@/services/accommodationQueryService'
import type { CountryFilterValue } from '@/types/Attraction'

export function useAccommodation(country: CountryFilterValue) {
  const { data: allAccommodations = [], isLoading, error } = useQuery(
    getAccommodationsQueryOptions()
  )

  const accommodations = useMemo(() => {
    if (country === 'all') return allAccommodations

    return allAccommodations.filter(
      acc => (acc.country ?? 'general') === country
    )
  }, [allAccommodations, country])

  return {
    accommodations,
    isLoading,
    error
  }
}