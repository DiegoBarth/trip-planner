import type { BudgetOrigin } from './Attraction'

export interface Budget {
   id: number
   origin: BudgetOrigin
   description: string
   amount: number
   date: string
}

export interface BudgetSummary {
   Diego: {
      total: number
      spent: number
      remaining: number
   }
   Pamela: {
      total: number
      spent: number
      remaining: number
   }
   Casal: {
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