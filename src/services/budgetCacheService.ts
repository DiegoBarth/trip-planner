import type { QueryClient } from '@tanstack/react-query'
import type { Budget } from '@/types/Budget'

const BUDGET_QUERY_KEY = ['budgets']

export function updateBudgetCacheOnCreate(
   queryClient: QueryClient,
   newBudget: Budget
) {
   queryClient.setQueryData<Budget[]>(
      BUDGET_QUERY_KEY,
      old => (old ? [...old, newBudget] : [newBudget])
   )
}

export function updateBudgetCacheOnUpdate(
   queryClient: QueryClient,
   previousBudget: Budget,
   updatedBudget: Budget
) {
   queryClient.setQueryData<Budget[]>(
      BUDGET_QUERY_KEY,
      old =>
         old
            ? old.map(budget =>
               budget.id === previousBudget.id
                  ? updatedBudget
                  : budget
            )
            : [updatedBudget]
   )
}

export function updateBudgetCacheOnDelete(
   queryClient: QueryClient,
   deletedBudgetId: number
) {
   queryClient.setQueryData<Budget[]>(
      BUDGET_QUERY_KEY,
      old =>
         old ? old.filter(budget => budget.id !== deletedBudgetId) : []
   )
}