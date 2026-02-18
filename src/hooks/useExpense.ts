import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
   createExpense,
   updateExpense,
   deleteExpense,
   getExpenses,
} from '@/api/expense'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type {
   CreateExpensePayload,
   UpdateExpensePayload,
} from '@/api/expense'
import type { Country } from '@/types/Attraction'
import type { Expense } from '@/types/Expense'
import {
   updateExpenseCacheOnCreate,
   updateExpenseCacheOnUpdate,
   updateExpenseCacheOnDelete,
} from '@/services/expenseCacheService'

const BUDGET_SUMMARY_QUERY_KEY = ['budget_summary']

/**
 * Hook to manage expense operations
 */
export function useExpense(country: Country) {
   const queryClient = useQueryClient()
   const EXPENSE_QUERY_KEY = ['expenses', country]

   // Fetch expenses
   const { data: expenses = [], isLoading, error } = useQuery({
      queryKey: EXPENSE_QUERY_KEY,
      queryFn: () => getExpenses(country),
      staleTime: QUERY_STALE_TIME_MS,
   })

   // Create expense
   const createMutation = useMutation({
      mutationFn: (payload: CreateExpensePayload) =>
         createExpense(payload),
      onSuccess: newExpense => {
         const targetCountry = newExpense.country ?? country
         updateExpenseCacheOnCreate(queryClient, targetCountry, newExpense)
         queryClient.invalidateQueries({ queryKey: BUDGET_SUMMARY_QUERY_KEY })
      },
   })

   // Update expense
   const updateMutation = useMutation({
      mutationFn: (payload: UpdateExpensePayload) =>
         updateExpense(payload),

      onSuccess: updatedExpense => {
         const previousExpenses =
            queryClient.getQueryData<Expense[]>(EXPENSE_QUERY_KEY)

         const previousExpense = previousExpenses?.find(
            e => e.id === updatedExpense.id
         )

         if (!previousExpense) return

         updateExpenseCacheOnUpdate(queryClient, previousExpense, updatedExpense)
         queryClient.invalidateQueries({ queryKey: BUDGET_SUMMARY_QUERY_KEY })
      },
   })

   // Delete expense
   const deleteMutation = useMutation({
      mutationFn: (id: number) => deleteExpense(id),

      onSuccess: (_, deletedId) => {
         const previousExpenses =
            queryClient.getQueryData<Expense[]>(EXPENSE_QUERY_KEY)

         const deletedExpense = previousExpenses?.find(
            e => e.id === deletedId
         )

         if (!deletedExpense) return

         updateExpenseCacheOnDelete(queryClient, country, deletedId)
         queryClient.invalidateQueries({ queryKey: BUDGET_SUMMARY_QUERY_KEY })
      },
   })

   return {
      expenses,
      isLoading,
      error,
      createExpense: createMutation.mutateAsync,
      updateExpense: updateMutation.mutateAsync,
      deleteExpense: deleteMutation.mutateAsync,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
   }
}
