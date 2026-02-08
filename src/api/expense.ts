import { apiGet, apiPost } from './client'
import type { Expense } from '@/types/Expense'

interface ApiResponse<T> {
   success: boolean
   data?: T
   message?: string
}

export interface CreateExpensePayload {
   category: Expense['category']
   description: string
   amount: number
   currency: Expense['currency']
   amountInBRL: number
   budgetOrigin: Expense['budgetOrigin']
   date: string
   country?: Expense['country']
   notes?: string
   receiptUrl?: string
}

export interface UpdateExpensePayload extends CreateExpensePayload {
   id: number
}

/**
 * Create a new expense entry
 */
export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
   const response = await apiPost<ApiResponse<Expense>>({
      action: 'createExpense',
      data: payload
   })

   if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create expense')
   }

   return response.data
}

/**
 * Update an existing expense entry
 */
export async function updateExpense(payload: UpdateExpensePayload): Promise<Expense> {
   const response = await apiPost<ApiResponse<Expense>>({
      action: 'updateExpense',
      data: payload
   })

   if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update expense')
   }

   return response.data
}

/**
 * Delete an expense entry by ID
 */
export async function deleteExpense(id: number): Promise<void> {
   const response = await apiPost<ApiResponse<null>>({
      action: 'deleteExpense',
      id
   })

   if (!response.success) {
      throw new Error(response.message || 'Failed to delete expense')
   }
}

/**
 * Get all expenses
 */
export async function getExpenses(): Promise<Expense[]> {
   const response = await apiGet<ApiResponse<Expense[]>>({
      action: 'getExpenses'
   })

   if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch expenses')
   }

   return response.data
}
