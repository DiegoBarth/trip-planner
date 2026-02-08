import type { BudgetOrigin } from './Attraction'

export interface Budget {
   id: string
   origin: BudgetOrigin
   description: string
   amount: number
   type: 'income' | 'adjustment'
   date: string
}

export interface BudgetSummary {
   diego: {
      total: number
      spent: number
      remaining: number
   }
   pamela: {
      total: number
      spent: number
      remaining: number
   }
   couple: {
      total: number
      spent: number
      remaining: number
   }
   grandTotal: {
      total: number
      spent: number
      remaining: number
   }
}