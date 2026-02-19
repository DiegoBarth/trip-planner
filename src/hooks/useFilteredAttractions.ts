import { useMemo } from 'react'
import type { Attraction } from '@/types/Attraction'

export function useFilteredAttractions(
   attractions: Attraction[],
   country: string,
   day: string | number
) {
   return useMemo(() => {
      return attractions.filter(a => {
         const matchesCountry = country === 'general' || a.country === country
         const matchesDay = day === 'all' || a.day === Number(day)
         const hasCoords = Number(a.lat) !== 0 && Number(a.lng) !== 0

         return matchesCountry && matchesDay && hasCoords
      })
   }, [attractions, country, day])
}