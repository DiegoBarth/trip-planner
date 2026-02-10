import type { QueryClient } from '@tanstack/react-query'
import type { Expense } from '@/types/Expense'
import type { Country } from '@/types/Attraction'

const getExpenseQueryKey = (country: Country) => ['expenses', country]

export function updateExpenseCacheOnCreate(
   queryClient: QueryClient,
   country: Country,
   newExpense: Expense
) {
   const queryKey = getExpenseQueryKey(country)

   queryClient.setQueryData<Expense[]>(
      queryKey,
      old => (old ? [...old, newExpense] : [newExpense])
   )
}

export function updateExpenseCacheOnUpdate(
   queryClient: QueryClient,
   country: Country,
   previousExpense: Expense,
   updatedExpense: Expense
) {
   const queryKey = getExpenseQueryKey(country)

   queryClient.setQueryData<Expense[]>(
      queryKey,
      old =>
         old
            ? old.map(expense =>
               expense.id === previousExpense.id
                  ? updatedExpense
                  : expense
            )
            : [updatedExpense]
   )
}

export function updateExpenseCacheOnDelete(
   queryClient: QueryClient,
   country: Country,
   deletedExpenseId: number
) {
   const queryKey = getExpenseQueryKey(country)

   queryClient.setQueryData<Expense[]>(
      queryKey,
      old =>
         old ? old.filter(expense => expense.id !== deletedExpenseId) : []
   )
}
