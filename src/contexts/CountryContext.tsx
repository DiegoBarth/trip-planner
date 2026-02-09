import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Country } from '@/types/Attraction'

type DayFilter = number | 'all'
type CountryFilter = Country | 'all'

interface CountryContextType {
   country: CountryFilter
   setCountry: (country: CountryFilter) => void
   day: DayFilter
   setDay: (day: DayFilter) => void
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
   setDay: () => { }
})

export function CountryProvider({ children }: { children: ReactNode }) {
   const initialFilter = getInitialFilter()

   const [country, setCountry] = useState<CountryFilter>(initialFilter.country)
   const [day, setDay] = useState<DayFilter>(initialFilter.day)

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
            setDay
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