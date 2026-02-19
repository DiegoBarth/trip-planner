import type { QueryClient } from '@tanstack/react-query'
import type { Expense } from '@/types/Expense'

const EXPENSE_QUERY_KEY = ['expenses'];

export function updateExpenseCacheOnCreate(queryClient: QueryClient, newExpense: Expense) {
  queryClient.setQueryData<Expense[]>(
    EXPENSE_QUERY_KEY,
    old => (old ? [...old, newExpense] : [newExpense])
  );
}

export function updateExpenseCacheOnUpdate(queryClient: QueryClient, previousExpense: Expense, updatedExpense: Expense) {
  const id = previousExpense.id;

  queryClient.setQueryData<Expense[]>(
    EXPENSE_QUERY_KEY,
    old =>
      old
        ? old.map(exp => (exp.id === id ? updatedExpense : exp))
        : [updatedExpense]
  );
}

export function updateExpenseCacheOnDelete(queryClient: QueryClient, deletedExpenseId: number) {
  queryClient.setQueryData<Expense[]>(EXPENSE_QUERY_KEY, old => {
    if (!old) return [];

    return old.filter(expense => expense.id !== deletedExpenseId)
      .map(expense => {
        if (expense.id > deletedExpenseId) {
          return { ...expense, id: expense.id - 1 };
        }

        return expense;
      });
  });
}