import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createExpense, updateExpense, deleteExpense, getExpenses } from '@/api/expense'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type { CreateExpensePayload, UpdateExpensePayload } from '@/api/expense'
import type { Country } from '@/types/Attraction'

/**
 * Hook to manage expense operations
 */
export function useExpense(country: Country) {
   const EXPENSE_QUERY_KEY = ['expenses', country]
   const queryClient = useQueryClient()

   // Fetch all expenses
   const { data: expenses = [], isLoading, error } = useQuery({
      queryKey: EXPENSE_QUERY_KEY,
      queryFn: () => getExpenses(country),
      staleTime: QUERY_STALE_TIME_MS,
   })

   // Create expense mutation
   const createMutation = useMutation({
      mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: EXPENSE_QUERY_KEY })
      },
   })

   // Update expense mutation
   const updateMutation = useMutation({
      mutationFn: (payload: UpdateExpensePayload) => updateExpense(payload),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: EXPENSE_QUERY_KEY })
      },
   })

   // Delete expense mutation
   const deleteMutation = useMutation({
      mutationFn: (id: number) => deleteExpense(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: EXPENSE_QUERY_KEY })
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
