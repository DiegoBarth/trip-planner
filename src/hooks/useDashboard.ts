import { useQueryClient, useIsFetching } from '@tanstack/react-query'
import type { Country } from '@/types/Attraction'
import type { Budget } from '@/types/Budget'
import type { Expense } from '@/types/Expense'
import type { Attraction } from '@/types/Attraction'
import {
   selectTotalSpent,
   selectExpensesByCategory,
   selectBudgetByOrigin,
   selectAttractionStatus,
   calculateDaysOfTrip
} from '@/selectors/dashboardSelectors'
import type { UseDashboardResult } from '@/types/Dashboard'


export function useDashboard(country: Country): UseDashboardResult {
   const queryClient = useQueryClient()
   const isFetching = useIsFetching()

   const expenses =
      queryClient.getQueryData<Expense[]>(['expenses', country]) ?? []

   const budgets =
      queryClient.getQueryData<Budget[]>(['budgets']) ?? []

   const attractions =
      queryClient.getQueryData<Attraction[]>(['attractions', country]) ?? []

   const daysOfTrip = calculateDaysOfTrip(attractions)

   if (isFetching > 0) {
      return { isReady: false }
   }

   const attractionStatus = selectAttractionStatus(attractions)

   const visitedPercentage =
      attractionStatus.total > 0
         ? (attractionStatus.visited / attractionStatus.total) * 100
         : 0

   const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0)
   const totalSpent = selectTotalSpent(expenses)

   return {
      isReady: true,
      stats: {
         totalSpent: selectTotalSpent(expenses),
         expensesByCategory: selectExpensesByCategory(expenses),
         budgetByOrigin: selectBudgetByOrigin(budgets, expenses),
         attractionStatus: {
            ...attractionStatus,
            visitedPercentage,
         },
         totalBudget,
         remaining: totalBudget - totalSpent,
         daysOfTrip,
      },
   }

}