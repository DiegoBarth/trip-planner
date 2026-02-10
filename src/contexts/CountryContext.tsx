import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Country } from '@/types/Attraction'
import { useAttraction } from '@/hooks/useAttraction'

type DayFilter = number | 'all'
type CountryFilter = Country | 'all'

interface CountryContextType {
   country: CountryFilter
   setCountry: (country: CountryFilter) => void
   day: DayFilter
   setDay: (day: DayFilter) => void
   availableDays: number[]
}

/**
 * Recupera o filtro salvo ou usa valores default
 */
function getInitialFilter(): {
   country: CountryFilter
   day: DayFilter
} {
   const saved = sessionStorage.getItem('trip_filter')
   if (saved) return JSON.parse(saved)

   return {
      country: 'all',
      day: 'all'
   }
}

export const CountryContext = createContext<CountryContextType>({
   country: 'all',
   setCountry: () => { },
   day: 'all',
   setDay: () => { },
   availableDays: []
})

export function CountryProvider({ children }: { children: ReactNode }) {
   const initialFilter = getInitialFilter()

   const [country, setCountry] = useState<CountryFilter>(initialFilter.country)
   const [day, setDay] = useState<DayFilter>(initialFilter.day)

   const { attractions } = useAttraction(country)

   const availableDays = useMemo(() => {
      const attractionsToConsider = country === 'all'
         ? attractions
         : attractions.filter(attr => attr.country === country)

      const uniqueDays = new Set<number>()
      attractionsToConsider.forEach(attr => {
         if (attr.day) uniqueDays.add(attr.day)
      })

      return Array.from(uniqueDays).sort((a, b) => a - b)
   }, [attractions, country])

   useEffect(() => {
      setDay('all')
   }, [country])

   useEffect(() => {
      sessionStorage.setItem(
         'trip_filter',
         JSON.stringify({ country, day })
      )
   }, [country, day])

   return (
      <CountryContext.Provider
         value={{
            country,
            setCountry,
            day,
            setDay,
            availableDays
         }}
      >
         {children}
      </CountryContext.Provider>
   )
}

/**
 * Hook helper
 */
export const useCountry = () => useContext(CountryContext)