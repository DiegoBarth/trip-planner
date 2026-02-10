import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useBudget } from '@/hooks/useBudget'
import { useExpense } from '@/hooks/useExpense'
import { useAttraction } from '@/hooks/useAttraction'
import { useDashboard } from '@/hooks/useDashboard'
import type { Budget, BudgetSummary } from '@/types/Budget'
import type { Expense } from '@/types/Expense'
import type { Attraction, Country } from '@/types/Attraction'
import type { DashboardStats } from '@/types/Dashboard'
import { useIsFetching } from '@tanstack/react-query'

type DayFilter = number | 'all'
type CountryFilter = Country | 'all'

interface CountryContextType {
   isReady: boolean
   country: CountryFilter
   setCountry: (country: CountryFilter) => void
   day: DayFilter
   setDay: (day: DayFilter) => void
   budgets: Budget[]
   budgetSummary: BudgetSummary
   expenses: Expense[]
   attractions: Attraction[]
   dashboard: DashboardStats
   availableDays: number[]
}

function getInitialFilter(): { country: CountryFilter; day: DayFilter } {
   const saved = sessionStorage.getItem('trip_filter')
   if (saved) return JSON.parse(saved)
   return { country: 'all', day: 'all' }
}

export const CountryContext = createContext<CountryContextType>({
   isReady: false,
   country: 'all',
   setCountry: () => { },
   day: 'all',
   setDay: () => { },
   budgets: [],
   budgetSummary: { totalBudget: 0, totalSpent: 0, remainingBalance: 0, byOrigin: {} },
   expenses: [],
   attractions: [],
   dashboard: {
      totalBudget: 0,
      totalSpent: 0,
      remaining: 0,
      daysOfTrip: 0,
      expensesByCategory: [],
      budgetByOrigin: [],
      attractionStatus: { total: 0, visited: 0, pendingReservation: 0, visitedPercentage: 0 },
   },
   availableDays: []
})

export function CountryProvider({ children }: { children: ReactNode }) {
   const initialFilter = getInitialFilter()
   const [country, setCountry] = useState<CountryFilter>(initialFilter.country)
   const [day, setDay] = useState<DayFilter>(initialFilter.day)

   const { budgets, budgetSummary: rawBudgetSummary } = useBudget()
   const { expenses } = useExpense(country)
   const { attractions } = useAttraction(country)
   const dashboardData = useDashboard({ budgets, expenses, attractions })

   const budgetSummary: BudgetSummary = rawBudgetSummary ?? {
      totalBudget: 0,
      totalSpent: 0,
      remainingBalance: 0,
      byOrigin: {}
   }

   const dashboard: DashboardStats = dashboardData?.stats ?? {
      totalBudget: 0,
      totalSpent: 0,
      remaining: 0,
      daysOfTrip: 0,
      expensesByCategory: [],
      budgetByOrigin: [],
      attractionStatus: { total: 0, visited: 0, pendingReservation: 0, visitedPercentage: 0 }
   }

   const availableDays = useMemo(() => {
      const filtered = country === 'all'
         ? attractions
         : attractions.filter(a => a.country === country)
      const uniqueDays = new Set<number>()
      filtered.forEach(a => { if (a.day) uniqueDays.add(a.day) })
      return Array.from(uniqueDays).sort((a, b) => a - b)
   }, [attractions, country])

   const isReady = useIsFetching() === 0

   useEffect(() => { setDay('all') }, [country])
   useEffect(() => {
      sessionStorage.setItem('trip_filter', JSON.stringify({ country, day }))
   }, [country, day])

   return (
      <CountryContext.Provider
         value={{
            isReady,
            country,
            setCountry,
            day,
            setDay,
            budgets,
            budgetSummary,
            expenses,
            attractions,
            dashboard,
            availableDays
         }}
      >
         {children}
      </CountryContext.Provider>
   )
}

export const useCountry = () => useContext(CountryContext)