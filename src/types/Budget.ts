import type { BudgetOrigin } from './Attraction'

/**
 * Single budget entry
 */
export interface Budget {
  id: number
  origin: BudgetOrigin
  description: string
  amount: number
  date: string // ISO string (YYYY-MM-DD)
}

/**
 * Base structure for any budget/balance totals
 */
export interface Totals {
  totalBudget: number
  totalSpent: number
  remainingBalance: number
}

/**
 * Summary of budgets grouped by origin/person
 */
export interface BudgetSummary extends Totals {
  byOrigin: Record<string, Totals>
}