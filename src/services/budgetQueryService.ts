import { getBudgets, getBudgetSummary } from '@/api/budget';
import { QUERY_STALE_TIME_MS } from '@/config/constants';

export const budgetsQueryKey = () => ['budgets'] as const;
export const budgetSummaryQueryKey = () => ['budget_summary'] as const;

export const getBudgetsQueryOptions = () => ({
  queryKey: budgetsQueryKey(),
  queryFn: getBudgets,
  staleTime: QUERY_STALE_TIME_MS,
  retry: 1
});

export const getBudgetSummaryQueryOptions = () => ({
  queryKey: budgetSummaryQueryKey(),
  queryFn: getBudgetSummary,
  staleTime: QUERY_STALE_TIME_MS,
  retry: 1
});