import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useBudget } from '@/hooks/useBudget'
import { useExpense } from '@/hooks/useExpense'
import { useAttraction } from '@/hooks/useAttraction'
import type { Budget, BudgetSummary } from '@/types/Budget'
import type { Expense } from '@/types/Expense'
import type { Attraction, Country } from '@/types/Attraction'

type DayFilter = number | 'all'
type CountryFilter = Country | 'all'

interface CountryContextType {
   country: CountryFilter
   setCountry: (country: CountryFilter) => void
   day: DayFilter
   setDay: (day: DayFilter) => void
   budgets: Budget[]
   budgetSummary: BudgetSummary
   expenses: Expense[]
   attractions: Attraction[]
   availableDays: number[]
}

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
   budgets: [],
   budgetSummary: {
      totalBudget: 0,
      totalSpent: 0,
      remainingBalance: 0,
      byOrigin: {}
   },
   expenses: [],
   attractions: [],
   availableDays: []
})

export function CountryProvider({ children }: { children: ReactNode }) {
   const initialFilter = getInitialFilter()

   const [country, setCountry] = useState<CountryFilter>(initialFilter.country)
   const [day, setDay] = useState<DayFilter>(initialFilter.day)

   const { budgets, budgetSummary: rawBudgetSummary } = useBudget()

   const budgetSummary: BudgetSummary = rawBudgetSummary ?? {
      totalBudget: 0,
      totalSpent: 0,
      remainingBalance: 0,
      byOrigin: {}
   }

   const { expenses } = useExpense(country)
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
            budgets,
            budgetSummary,
            expenses,
            attractions,
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