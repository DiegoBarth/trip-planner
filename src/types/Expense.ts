import type { BudgetOrigin, Currency } from './Attraction'

export type ExpenseCategory =
  | 'accommodation'
  | 'transport'
  | 'food'
  | 'attraction'
  | 'shopping'
  | 'cosmetics'
  | 'electronics'
  | 'other'

export interface Expense {
  id: number
  description: string
  amount: number
  currency: Currency
  amountInBRL: number
  category: ExpenseCategory
  budgetOrigin: BudgetOrigin
  date: string
  country?: 'japan' | 'south-korea' | 'general'
  notes?: string
  receiptUrl?: string
}

export interface ExpenseFilters {
  category?: ExpenseCategory
  budgetOrigin?: BudgetOrigin
  startDate?: string
  endDate?: string
}