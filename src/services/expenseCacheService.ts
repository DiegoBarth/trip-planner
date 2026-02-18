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
   previousExpense: Expense,
   updatedExpense: Expense
) {
   const prevCountry: Country = previousExpense.country ?? 'all'
   const nextCountry: Country = updatedExpense.country ?? 'all'
   const id = previousExpense.id

   if (prevCountry === nextCountry) {
      const queryKey = getExpenseQueryKey(prevCountry)
      queryClient.setQueryData<Expense[]>(
         queryKey,
         old =>
            old
               ? old.map(exp =>
                  exp.id === id ? updatedExpense : exp
               )
               : [updatedExpense]
      )
      return
   }

   // Country changed: remove from previous, add to new
   const prevKey = getExpenseQueryKey(prevCountry)
   queryClient.setQueryData<Expense[]>(prevKey, old =>
      old ? old.filter(exp => exp.id !== id) : []
   )
   const nextKey = getExpenseQueryKey(nextCountry)
   queryClient.setQueryData<Expense[]>(
      nextKey,
      old => {
         if (!old) return [updatedExpense]
         const idx = old.findIndex(exp => exp.id === id)
         if (idx >= 0) {
            const next = [...old]
            next[idx] = updatedExpense
            return next
         }
         return [...old, updatedExpense]
      }
   )
}

export function updateExpenseCacheOnDelete(
   queryClient: QueryClient,
   country: Country,
   deletedExpenseId: number
) {
   const queryKey = getExpenseQueryKey(country)

   queryClient.setQueryData<Expense[]>(queryKey, old => {
      if (!old) return []
      
      return old
         .filter(expense => expense.id !== deletedExpenseId)
         .map(expense => {
            if (expense.id > deletedExpenseId) {
               return { ...expense, id: expense.id - 1 }
            }
            return expense
         })
   })
}
