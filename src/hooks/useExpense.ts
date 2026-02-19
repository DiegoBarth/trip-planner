import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createExpense, updateExpense, deleteExpense, getExpenses } from '@/api/expense'
import { updateExpenseCacheOnCreate, updateExpenseCacheOnUpdate, updateExpenseCacheOnDelete } from '@/services/expenseCacheService'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type { CreateExpensePayload, UpdateExpensePayload } from '@/api/expense'
import type { CountryFilterValue } from '@/types/Attraction'
import type { Expense } from '@/types/Expense'

const BUDGET_SUMMARY_QUERY_KEY = ['budget_summary'];
const EXPENSE_QUERY_KEY = ['expenses'];

export function useExpense(country: CountryFilterValue) {
  const queryClient = useQueryClient();

  const { data: allExpenses = [], isLoading, error } = useQuery({
    queryKey: EXPENSE_QUERY_KEY,
    queryFn: getExpenses,
    staleTime: QUERY_STALE_TIME_MS,
  });

  const expenses = country === 'all' ? allExpenses : allExpenses.filter(e => (e.country ?? 'general') === country);

  const createMutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) =>
      createExpense(payload),
    onSuccess: newExpense => {
      updateExpenseCacheOnCreate(queryClient, newExpense);

      queryClient.invalidateQueries({ queryKey: BUDGET_SUMMARY_QUERY_KEY });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateExpensePayload) =>
      updateExpense(payload),
    onSuccess: updatedExpense => {
      const previousExpenses = queryClient.getQueryData<Expense[]>(EXPENSE_QUERY_KEY);
      const previousExpense = previousExpenses?.find(e => e.id === updatedExpense.id);

      if (!previousExpense) return

      updateExpenseCacheOnUpdate(queryClient, previousExpense, updatedExpense)

      queryClient.invalidateQueries({ queryKey: BUDGET_SUMMARY_QUERY_KEY })
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: (_, deletedId) => {
      const previousExpenses = queryClient.getQueryData<Expense[]>(EXPENSE_QUERY_KEY);
      const deletedExpense = previousExpenses?.find(e => e.id === deletedId);

      if (!deletedExpense) return;

      updateExpenseCacheOnDelete(queryClient, deletedId);

      queryClient.invalidateQueries({ queryKey: BUDGET_SUMMARY_QUERY_KEY });
    }
  });

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