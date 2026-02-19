import { apiGet, apiPost } from '@/api/client'
import type { Budget, BudgetSummary } from '@/types/Budget'

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
  id: number
}

/**
 * Create a new budget entry
 */
export async function createBudget(payload: CreateBudgetPayload): Promise<Budget> {
  const response = await apiPost<ApiResponse<Budget>>({
    action: 'createBudget',
    data: payload
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to create budget');
  }

  return response.data;
}

/**
 * Update an existing budget entry
 */
export async function updateBudget(payload: UpdateBudgetPayload): Promise<Budget> {
  const response = await apiPost<ApiResponse<Budget>>({
    action: 'updateBudget',
    data: payload
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to update budget');
  }

  return response.data;
}

/**
 * Delete a budget entry by ID
 */
export async function deleteBudget(id: number): Promise<void> {
  const response = await apiPost<ApiResponse<null>>({
    action: 'deleteBudget',
    id
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to delete budget');
  }
}

/**
 * Get all budgets
 */
export async function getBudgets(): Promise<Budget[]> {
  const response = await apiGet<ApiResponse<Budget[]>>({
    action: 'getBudgets'
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch budgets');
  }

  return response.data;
}

/**
 * Get the budget summary
 */
export async function getBudgetSummary(): Promise<BudgetSummary> {
  const response = await apiGet<ApiResponse<BudgetSummary>>({
    action: 'getBudgetSummary'
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch balance');
  }

  return response.data;
}