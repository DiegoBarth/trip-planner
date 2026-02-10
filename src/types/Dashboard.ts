// src/types/Dashboard.ts
import type { ExpenseCategory } from '@/types/Expense'
import type { BudgetOrigin } from '@/types/Attraction'

export interface ExpenseByCategory {
   category: ExpenseCategory
   total: number
}

export interface BudgetByOrigin {
   origin: BudgetOrigin
   totalBudget: number
   spent: number
   remaining: number
}

export interface AttractionStats {
   total: number
   visited: number
   pendingReservation: number
   visitedPercentage: number
}

export interface DashboardStats {
   totalBudget: number
   totalSpent: number
   remaining: number
   daysOfTrip: number

   expensesByCategory: ExpenseByCategory[]
   budgetByOrigin: BudgetByOrigin[]
   attractionStatus: AttractionStats
}

export interface UseDashboardResult {
   stats?: DashboardStats
}