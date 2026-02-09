import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBudget, updateBudget, deleteBudget, getBudgets, getBudgetSummary } from '@/api/budget'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type { CreateBudgetPayload, UpdateBudgetPayload } from '@/api/budget'
import type { BudgetSummary } from '@/types/Budget'

const BUDGET_QUERY_KEY = ['budgets']
const BUDGET_SUMMARY_QUERY_KEY = ['budget_summary']

/**
 * Hook to manage budget operations
 */
export function useBudget() {
   const queryClient = useQueryClient()

   const { data: budgetSummary } = useQuery<BudgetSummary>({
      queryKey: BUDGET_SUMMARY_QUERY_KEY,
      queryFn: getBudgetSummary,
      staleTime: QUERY_STALE_TIME_MS,
   })

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
      mutationFn: (id: number) => deleteBudget(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: BUDGET_QUERY_KEY })
      },
   })

   return {
      budgets,
      budgetSummary,
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
