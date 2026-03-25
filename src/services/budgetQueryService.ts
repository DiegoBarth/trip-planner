import { getBudgets, getBudgetSummary } from '@/api/budget';
import { shouldRefetchOnFocus } from '@/services/refetchPolicy'
import { OFFLINE_STALE_TIME_MS } from '@/config/constants';

export const budgetsQueryKey = () => ['budgets'] as const;
export const budgetSummaryQueryKey = () => ['budget_summary'] as const;

export const getBudgetsQueryOptions = () => ({
  queryKey: budgetsQueryKey(),
  queryFn: getBudgets,
  staleTime: OFFLINE_STALE_TIME_MS,
  retry: 1,
  refetchOnWindowFocus: shouldRefetchOnFocus
});

export const getBudgetSummaryQueryOptions = () => ({
  queryKey: budgetSummaryQueryKey(),
  queryFn: getBudgetSummary,
  staleTime: OFFLINE_STALE_TIME_MS,
  retry: 1,
  refetchOnWindowFocus: shouldRefetchOnFocus
});