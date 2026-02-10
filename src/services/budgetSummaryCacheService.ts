import { QueryClient } from '@tanstack/react-query'
import type { Budget, BudgetSummary, Totals } from '@/types/Budget'

const SUMMARY_QUERY_KEY = ['budget_summary']

function createEmptyTotals(): Totals {
   return {
      totalBudget: 0,
      totalSpent: 0,
      remainingBalance: 0,
   }
}

/* ================= CREATE ================= */

export function updateSummaryAfterBudgetCreate(
   queryClient: QueryClient,
   budget: Budget
) {
   const summary = queryClient.getQueryData<BudgetSummary>(SUMMARY_QUERY_KEY)
   if (!summary) return

   const amount = Number(budget.amount)
   const originTotals = summary.byOrigin[budget.origin] ?? createEmptyTotals()

   const updatedOrigin: Totals = {
      totalBudget: originTotals.totalBudget + amount,
      totalSpent: originTotals.totalSpent,
      remainingBalance: originTotals.remainingBalance + amount,
   }

   queryClient.setQueryData<BudgetSummary>(SUMMARY_QUERY_KEY, {
      ...summary,
      totalBudget: summary.totalBudget + amount,
      remainingBalance: summary.remainingBalance + amount,
      byOrigin: {
         ...summary.byOrigin,
         [budget.origin]: updatedOrigin,
      },
   })
}

/* ================= UPDATE ================= */

export function updateSummaryAfterBudgetUpdate(
   queryClient: QueryClient,
   previous: Budget,
   updated: Budget
) {
   const summary = queryClient.getQueryData<BudgetSummary>(SUMMARY_QUERY_KEY)
   if (!summary) return

   const prevAmount = Number(previous.amount)
   const newAmount = Number(updated.amount)
   const amountDiff = newAmount - prevAmount

   if (amountDiff === 0 && previous.origin === updated.origin) return

   const byOrigin = { ...summary.byOrigin }

   if (previous.origin === updated.origin) {
      // 🟡 Same origin → apply only diff
      const totals = byOrigin[previous.origin] ?? createEmptyTotals()

      byOrigin[previous.origin] = {
         totalBudget: totals.totalBudget + amountDiff,
         totalSpent: totals.totalSpent,
         remainingBalance: totals.remainingBalance + amountDiff,
      }
   } else {
      // 🔴 Remove from old origin
      const prevTotals = byOrigin[previous.origin] ?? createEmptyTotals()
      byOrigin[previous.origin] = {
         totalBudget: prevTotals.totalBudget - prevAmount,
         totalSpent: prevTotals.totalSpent,
         remainingBalance: prevTotals.remainingBalance - prevAmount,
      }

      // 🟢 Add to new origin
      const newTotals = byOrigin[updated.origin] ?? createEmptyTotals()
      byOrigin[updated.origin] = {
         totalBudget: newTotals.totalBudget + newAmount,
         totalSpent: newTotals.totalSpent,
         remainingBalance: newTotals.remainingBalance + newAmount,
      }
   }

   queryClient.setQueryData<BudgetSummary>(SUMMARY_QUERY_KEY, {
      ...summary,
      totalBudget: summary.totalBudget + amountDiff,
      remainingBalance: summary.remainingBalance + amountDiff,
      byOrigin,
   })
}

/* ================= DELETE ================= */

export function updateSummaryAfterBudgetDelete(
   queryClient: QueryClient,
   budget: Budget
) {
   const summary = queryClient.getQueryData<BudgetSummary>(SUMMARY_QUERY_KEY)
   if (!summary) return

   const amount = Number(budget.amount)
   const originTotals = summary.byOrigin[budget.origin]
   if (!originTotals) return

   queryClient.setQueryData<BudgetSummary>(SUMMARY_QUERY_KEY, {
      ...summary,
      totalBudget: summary.totalBudget - amount,
      remainingBalance: summary.remainingBalance - amount,
      byOrigin: {
         ...summary.byOrigin,
         [budget.origin]: {
            totalBudget: originTotals.totalBudget - amount,
            totalSpent: originTotals.totalSpent,
            remainingBalance: originTotals.remainingBalance - amount,
         },
      },
   })
}