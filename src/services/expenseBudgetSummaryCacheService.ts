import type { QueryClient } from '@tanstack/react-query'
import type { Expense } from '@/types/Expense'
import type { BudgetSummary, Totals } from '@/types/Budget'

const SUMMARY_QUERY_KEY = ['budget_summary']

export function updateSummaryAfterExpenseCreate(
   queryClient: QueryClient,
   expense: Expense
) {
   const summary =
      queryClient.getQueryData<BudgetSummary>(SUMMARY_QUERY_KEY)

   if (!summary) return

   const spent = Number(expense.amountInBRL)
   const origin = expense.budgetOrigin

   const currentOriginTotals: Totals =
      summary.byOrigin[origin] ?? {
         totalBudget: 0,
         totalSpent: 0,
         remainingBalance: 0,
      }

   const updatedOriginTotals: Totals = {
      totalBudget: currentOriginTotals.totalBudget,
      totalSpent: currentOriginTotals.totalSpent + spent,
      remainingBalance:
         currentOriginTotals.remainingBalance - spent,
   }

   const updatedSummary: BudgetSummary = {
      totalBudget: summary.totalBudget,
      totalSpent: summary.totalSpent + spent,
      remainingBalance: summary.remainingBalance - spent,
      byOrigin: {
         ...summary.byOrigin,
         [origin]: updatedOriginTotals,
      },
   }

   queryClient.setQueryData(SUMMARY_QUERY_KEY, updatedSummary)
}

export function updateSummaryAfterExpenseUpdate(
   queryClient: QueryClient,
   previousExpense: Expense,
   updatedExpense: Expense
) {
   const summary =
      queryClient.getQueryData<BudgetSummary>(SUMMARY_QUERY_KEY)

   if (!summary) return

   const oldSpent = Number(previousExpense.amountInBRL)
   const newSpent = Number(updatedExpense.amountInBRL)
   const diff = newSpent - oldSpent

   if (diff === 0) return

   const origin = previousExpense.budgetOrigin
   const currentOriginTotals = summary.byOrigin[origin]

   if (!currentOriginTotals) return

   const updatedOriginTotals: Totals = {
      totalBudget: currentOriginTotals.totalBudget,
      totalSpent: currentOriginTotals.totalSpent + diff,
      remainingBalance:
         currentOriginTotals.remainingBalance - diff,
   }

   const updatedSummary: BudgetSummary = {
      totalBudget: summary.totalBudget,
      totalSpent: summary.totalSpent + diff,
      remainingBalance: summary.remainingBalance - diff,
      byOrigin: {
         ...summary.byOrigin,
         [origin]: updatedOriginTotals,
      },
   }

   queryClient.setQueryData(SUMMARY_QUERY_KEY, updatedSummary)
}

export function updateSummaryAfterExpenseDelete(
   queryClient: QueryClient,
   expense: Expense
) {
   const summary =
      queryClient.getQueryData<BudgetSummary>(SUMMARY_QUERY_KEY)

   if (!summary) return

   const spent = Number(expense.amountInBRL)
   const origin = expense.budgetOrigin
   const currentOriginTotals = summary.byOrigin[origin]

   if (!currentOriginTotals) return

   const updatedOriginTotals: Totals = {
      totalBudget: currentOriginTotals.totalBudget,
      totalSpent: currentOriginTotals.totalSpent - spent,
      remainingBalance:
         currentOriginTotals.remainingBalance + spent,
   }

   const updatedSummary: BudgetSummary = {
      totalBudget: summary.totalBudget,
      totalSpent: summary.totalSpent - spent,
      remainingBalance: summary.remainingBalance + spent,
      byOrigin: {
         ...summary.byOrigin,
         [origin]: updatedOriginTotals,
      },
   }

   queryClient.setQueryData(SUMMARY_QUERY_KEY, updatedSummary)
}