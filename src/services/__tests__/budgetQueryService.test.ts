import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  budgetsQueryKey,
  budgetSummaryQueryKey,
  getBudgetsQueryOptions,
  getBudgetSummaryQueryOptions,
} from '../budgetQueryService'

const mockGetBudgets = vi.fn()
const mockGetBudgetSummary = vi.fn()
vi.mock('@/api/budget', () => ({
  getBudgets: (...args: unknown[]) => mockGetBudgets(...args),
  getBudgetSummary: (...args: unknown[]) => mockGetBudgetSummary(...args),
}))

describe('budgetQueryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('budgetsQueryKey returns stable key', () => {
    expect(budgetsQueryKey()).toEqual(['budgets'])
  })

  it('budgetSummaryQueryKey returns stable key', () => {
    expect(budgetSummaryQueryKey()).toEqual(['budget_summary'])
  })

  it('getBudgetsQueryOptions returns queryKey and queryFn that calls getBudgets', async () => {
    mockGetBudgets.mockResolvedValue([])
    const options = getBudgetsQueryOptions()
    expect(options.queryKey).toEqual(['budgets'])
    await options.queryFn()
    expect(mockGetBudgets).toHaveBeenCalledTimes(1)
  })

  it('getBudgetSummaryQueryOptions returns queryKey and queryFn that calls getBudgetSummary', async () => {
    mockGetBudgetSummary.mockResolvedValue({})
    const options = getBudgetSummaryQueryOptions()
    expect(options.queryKey).toEqual(['budget_summary'])
    await options.queryFn()
    expect(mockGetBudgetSummary).toHaveBeenCalledTimes(1)
  })
})
