import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { useIsFetching } from '@tanstack/react-query'
import { useBudget } from '@/hooks/useBudget'
import { useExpense } from '@/hooks/useExpense'
import { useAttraction } from '@/hooks/useAttraction'
import { useDashboard } from '@/hooks/useDashboard'
import { useCurrency } from '@/hooks/useCurrency'
import { useAccommodation } from '@/hooks/useAccommodation'
import { useChecklist } from '@/hooks/useChecklist'
import { useReservation } from '@/hooks/useReservation'
import type { CurrencyRates } from '@/types/Currency'
import type { Budget, BudgetSummary } from '@/types/Budget'
import type { Expense } from '@/types/Expense'
import type { Attraction, Country } from '@/types/Attraction'
import type { DashboardStats } from '@/types/Dashboard'
import type { Accommodation } from '@/types/Accommodation'
import type { ChecklistItem } from '@/types/ChecklistItem'
import type { Reservation } from '@/types/Reservation'

type DayFilter = number | 'all'
type CountryFilter = Country | 'all'

interface CountryContextType {
   isReady: boolean
   country: CountryFilter
   setCountry: (country: CountryFilter) => void
   day: DayFilter
   setDay: (day: DayFilter) => void
   rates: CurrencyRates | null
   budgets: Budget[]
   budgetSummary: BudgetSummary
   expenses: Expense[]
   attractions: Attraction[]
   dashboard: DashboardStats
   availableDays: number[]
   accommodations: Accommodation[]
   checklistItems: ChecklistItem[]
   reservations: Reservation[]
}

function getInitialFilter(): { country: CountryFilter; day: DayFilter } {
   const saved = sessionStorage.getItem('trip_filter')
   if (!saved) return { country: 'all', day: 'all' }
   try {
      const parsed = JSON.parse(saved)
      if (parsed && typeof parsed.country !== 'undefined' && typeof parsed.day !== 'undefined') {
         return parsed
      }
   } catch {
      sessionStorage.removeItem('trip_filter')
   }
   return { country: 'all', day: 'all' }
}

export const CountryContext = createContext<CountryContextType>({
   isReady: false,
   country: 'all',
   setCountry: () => { },
   day: 'all',
   setDay: () => { },
   rates: null,
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
   availableDays: [],
   accommodations: [],
   checklistItems: [],
   reservations: []
})

export function CountryProvider({ children }: { children: ReactNode }) {
   const initialFilter = getInitialFilter()
   const [country, setCountry] = useState<CountryFilter>(initialFilter.country)
   const [day, setDay] = useState<DayFilter>(initialFilter.day)

   const { budgets, budgetSummary: rawBudgetSummary } = useBudget()
   const { expenses } = useExpense(country)
   const { attractions } = useAttraction(country)
   const { rates } = useCurrency()
   const { accommodations } = useAccommodation()
   const { items: checklistItems } = useChecklist()
   const { reservations } = useReservation()

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
            rates,
            budgets,
            budgetSummary,
            expenses,
            attractions,
            dashboard,
            availableDays,
            accommodations,
            checklistItems,
            reservations
         }}
      >
         {children}
      </CountryContext.Provider>
   )
}

export const useCountry = () => useContext(CountryContext)