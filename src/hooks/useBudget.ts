import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBudget, updateBudget, deleteBudget, getBudgets } from '@/api/budget'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type { CreateBudgetPayload, UpdateBudgetPayload } from '@/api/budget'

const BUDGET_QUERY_KEY = ['budgets']

/**
 * Hook to manage budget operations
 */
export function useBudget() {
   const queryClient = useQueryClient()

   // Fetch all budgets
   const { data: budgets = [], isLoading, error } = useQuery({
      queryKey: BUDGET_QUERY_KEY,
      queryFn: getBudgets,
      staleTime: QUERY_STALE_TIME_MS,
   })

   // Create budget mutation
   const createMutation = useMutation({
      mutationFn: (payload: CreateBudgetPayload) => createBudget(payload),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: BUDGET_QUERY_KEY })
      },
   })

   // Update budget mutation
   const updateMutation = useMutation({
      mutationFn: (payload: UpdateBudgetPayload) => updateBudget(payload),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: BUDGET_QUERY_KEY })
      },
   })

   // Delete budget mutation
   const deleteMutation = useMutation({
      mutationFn: (id: string) => deleteBudget(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: BUDGET_QUERY_KEY })
      },
   })

   return {
      budgets,
      isLoading,
      error,
      createBudget: createMutation.mutateAsync,
      updateBudget: updateMutation.mutateAsync,
      deleteBudget: deleteMutation.mutateAsync,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
   }
}
