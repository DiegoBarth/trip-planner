import type { Budget } from '@/types/Budget'
import type { Expense, ExpenseCategory } from '@/types/Expense'
import type { Attraction } from '@/types/Attraction'
import type { BudgetOrigin } from '@/types/Attraction'
import { dateToInputFormat } from '@/utils/formatters'

export function selectTotalSpent(expenses: Expense[]) {
   return expenses.reduce((acc, e) => acc + e.amountInBRL, 0)
}

export function selectExpensesByCategory(expenses: Expense[]) {
   const map = new Map<ExpenseCategory, number>()

   expenses.forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amountInBRL)
   })

   return Array.from(map).map(([category, total]) => ({
      category,
      total,
   }))
}

export function selectBudgetByOrigin(
   budgets: Budget[],
   expenses: Expense[]
) {
   const budgetMap = new Map<BudgetOrigin, number>()
   const spentMap = new Map<BudgetOrigin, number>()

   budgets.forEach(b => {
      budgetMap.set(b.origin, (budgetMap.get(b.origin) || 0) + b.amount)
   })

   expenses.forEach(e => {
      spentMap.set(
         e.budgetOrigin,
         (spentMap.get(e.budgetOrigin) || 0) + e.amountInBRL
      )
   })

   return Array.from(budgetMap).map(([origin, totalBudget]) => {
      const spent = spentMap.get(origin) || 0
      return {
         origin,
         totalBudget,
         spent,
         remaining: totalBudget - spent,
      }
   })
}

export function selectAttractionStatus(attractions: Attraction[]) {
   return {
      total: attractions.length,
      visited: attractions.filter(a => a.visited).length,
      pendingReservation: attractions.filter(
         a => a.needsReservation && a.reservationStatus !== 'confirmed'
      ).length,
   }
}

export function calculateDaysOfTrip(attractions: Attraction[]): number {
   const dates = attractions
      .map(a => a.date)
      .filter(Boolean)
      .map(date => {
         const d = new Date(dateToInputFormat(date))
         return new Date(d.getFullYear(), d.getMonth(), d.getDate())
      })

   if (dates.length === 0) return 0

   const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
   const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

   const diffMs = maxDate.getTime() - minDate.getTime()
   const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

   return diffDays + 1
}