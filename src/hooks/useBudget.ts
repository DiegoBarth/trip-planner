import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
   createBudget,
   updateBudget,
   deleteBudget,
   getBudgets,
   getBudgetSummary
} from '@/api/budget'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type { CreateBudgetPayload, UpdateBudgetPayload } from '@/api/budget'
import type { Budget, BudgetSummary } from '@/types/Budget'

import {
   updateBudgetCacheOnCreate,
   updateBudgetCacheOnUpdate,
   updateBudgetCacheOnDelete
} from '@/services/budgetCacheService'

import {
   updateSummaryAfterBudgetCreate,
   updateSummaryAfterBudgetUpdate,
   updateSummaryAfterBudgetDelete
} from '@/services/budgetSummaryCacheService'

const BUDGET_QUERY_KEY = ['budgets']
const BUDGET_SUMMARY_QUERY_KEY = ['budget_summary']

export function useBudget() {
   const queryClient = useQueryClient()

   // Summary
   const { data: budgetSummary } = useQuery<BudgetSummary>({
      queryKey: BUDGET_SUMMARY_QUERY_KEY,
      queryFn: getBudgetSummary,
      staleTime: QUERY_STALE_TIME_MS,
   })

   // Budgets
   const { data: budgets = [], isLoading, error } = useQuery({
      queryKey: BUDGET_QUERY_KEY,
      queryFn: getBudgets,
      staleTime: QUERY_STALE_TIME_MS,
   })

   // Create
   const createMutation = useMutation({
      mutationFn: (payload: CreateBudgetPayload) => createBudget(payload),
      onSuccess: (newBudget) => {
         updateBudgetCacheOnCreate(queryClient, newBudget)
         updateSummaryAfterBudgetCreate(queryClient, newBudget)
      }
   })

   // Update
   const updateMutation = useMutation({
      mutationFn: (payload: UpdateBudgetPayload) => updateBudget(payload),
      onSuccess: (updatedBudget) => {
         const previousBudgets =
            queryClient.getQueryData<Budget[]>(BUDGET_QUERY_KEY)

         const previousBudget = previousBudgets?.find(
            b => b.id === updatedBudget.id
         )

         if (!previousBudget) return

         updateBudgetCacheOnUpdate(queryClient, previousBudget, updatedBudget)
         updateSummaryAfterBudgetUpdate(queryClient, previousBudget, updatedBudget)
      },
   })

   // Delete
   const deleteMutation = useMutation({
      mutationFn: (id: number) => deleteBudget(id),
      onSuccess: (_, deletedId) => {
         const oldBudgets =
            queryClient.getQueryData<Budget[]>(BUDGET_QUERY_KEY)

         const deletedBudget = oldBudgets?.find(
            b => b.id === deletedId
         )

         if (!deletedBudget) return

         updateBudgetCacheOnDelete(queryClient, deletedId)
         updateSummaryAfterBudgetDelete(queryClient, deletedBudget)
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