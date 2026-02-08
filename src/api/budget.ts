import { apiGet, apiPost } from './client'
import type { Budget } from '@/types/Budget'

interface ApiResponse<T> {
   success: boolean
   data?: T
   message?: string
}

export interface CreateBudgetPayload {
   origin: Budget['origin']
   description: string
   amount: number
   date: string
}

export interface UpdateBudgetPayload extends CreateBudgetPayload {
   id: string
}

/**
 * Create a new budget entry
 */
export async function createBudget(payload: CreateBudgetPayload): Promise<Budget> {
   const response = await apiPost<ApiResponse<Budget>>({
      action: 'createBudget',
      ...payload
   })

   if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create budget')
   }

   return response.data
}

/**
 * Update an existing budget entry
 */
export async function updateBudget(payload: UpdateBudgetPayload): Promise<Budget> {
   const response = await apiPost<ApiResponse<Budget>>({
      action: 'updateBudget',
      ...payload
   })

   if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update budget')
   }

   return response.data
}

/**
 * Delete a budget entry by ID
 */
export async function deleteBudget(id: string): Promise<void> {
   const response = await apiPost<ApiResponse<null>>({
      action: 'deleteBudget',
      id
   })

   if (!response.success) {
      throw new Error(response.message || 'Failed to delete budget')
   }
}

/**
 * Get all budgets
 */
export async function getBudgets(): Promise<Budget[]> {
   const response = await apiGet<ApiResponse<Budget[]>>({
      action: 'getBudgets'
   })

   if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch budgets')
   }

   return response.data
}
