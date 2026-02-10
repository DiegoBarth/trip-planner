import {
   selectTotalSpent,
   selectExpensesByCategory,
   selectBudgetByOrigin,
   selectAttractionStatus,
   calculateDaysOfTrip
} from '@/selectors/dashboardSelectors'
import type { Budget } from '@/types/Budget'
import type { Expense } from '@/types/Expense'
import type { Attraction } from '@/types/Attraction'
import type { UseDashboardResult } from '@/types/Dashboard'

export function useDashboard({ budgets, expenses, attractions }: {
   budgets: Budget[]
   expenses: Expense[]
   attractions: Attraction[]
}): UseDashboardResult {
   const daysOfTrip = calculateDaysOfTrip(attractions)
   const attractionStatus = selectAttractionStatus(attractions)

   const visitedPercentage =
      attractionStatus.total > 0
         ? (attractionStatus.visited / attractionStatus.total) * 100
         : 0

   const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0)
   const totalSpent = selectTotalSpent(expenses)

   return {
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