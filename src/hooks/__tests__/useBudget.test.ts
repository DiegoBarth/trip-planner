import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBudget } from '../useBudget'
import { createQueryClientWrapper } from './wrapper'

const mockGetBudgets = vi.fn()
const mockGetBudgetSummary = vi.fn()
const mockCreateBudget = vi.fn()
const mockUpdateBudget = vi.fn()
const mockDeleteBudget = vi.fn()

vi.mock('@/api/budget', () => ({
  getBudgets: (...args: unknown[]) => mockGetBudgets(...args),
  getBudgetSummary: (...args: unknown[]) => mockGetBudgetSummary(...args),
  createBudget: (...args: unknown[]) => mockCreateBudget(...args),
  updateBudget: (...args: unknown[]) => mockUpdateBudget(...args),
  deleteBudget: (...args: unknown[]) => mockDeleteBudget(...args),
}))

function makeBudget(overrides: Partial<{ id: number; amount: number; origin: string }> = {}) {
  return {
    id: 1,
    origin: 'Casal' as const,
    description: 'Test',
    amount: 1000,
    date: '2025-02-14',
    ...overrides,
  }
}

describe('useBudget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetBudgets.mockResolvedValue([])
    mockGetBudgetSummary.mockResolvedValue({ totalBudget: 0, totalSpent: 0 })
  })

  it('returns budgets, budgetSummary, and loading state', async () => {
    const budgets = [makeBudget({ id: 1 }), makeBudget({ id: 2 })]
    mockGetBudgets.mockResolvedValue(budgets)
    mockGetBudgetSummary.mockResolvedValue({ totalBudget: 2000, totalSpent: 500 })

    const Wrapper = createQueryClientWrapper()

    const { result } = renderHook(() => useBudget(), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.budgets).toHaveLength(2)
      expect(result.current.budgetSummary).toEqual({ totalBudget: 2000, totalSpent: 500 })
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.createBudget).toBeDefined()
    expect(result.current.updateBudget).toBeDefined()
    expect(result.current.deleteBudget).toBeDefined()
  })

  it('createBudget calls API', async () => {
    const newBudget = makeBudget({ id: 99 })
    mockCreateBudget.mockResolvedValue(newBudget)

    const Wrapper = createQueryClientWrapper()

    const { result } = renderHook(() => useBudget(), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.budgets).toEqual([]))

    await result.current.createBudget({
      origin: 'Casal',
      description: 'Test',
      amount: 1000,
      date: '2025-02-14',
    })

    expect(mockCreateBudget).toHaveBeenCalledTimes(1)
  })

  it('updateBudget calls API with payload', async () => {
    const budget = makeBudget({ id: 1, amount: 1000 })
    const updated = makeBudget({ id: 1, amount: 2000 })
    mockUpdateBudget.mockResolvedValue(updated)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['budgets'], data: [budget] }])
    const { result } = renderHook(() => useBudget(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.budgets).toHaveLength(1))
    await result.current.updateBudget({
      id: 1,
      origin: 'Casal',
      description: 'Test',
      amount: 2000,
      date: '2025-02-14',
    })
    expect(mockUpdateBudget).toHaveBeenCalledTimes(1)
  })

  it('deleteBudget calls API', async () => {
    const budget = makeBudget({ id: 1 })
    mockDeleteBudget.mockResolvedValue(undefined)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['budgets'], data: [budget] }])
    const { result } = renderHook(() => useBudget(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.budgets).toHaveLength(1))
    await result.current.deleteBudget(1)
    expect(mockDeleteBudget).toHaveBeenCalledWith(1)
  })

  it('returns refetch function', async () => {
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useBudget(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(typeof result.current.refetch).toBe('function')
  })

  it('exposes isCreating, isUpdating, isDeleting and error', async () => {
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useBudget(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isCreating).toBe(false)
    expect(result.current.isUpdating).toBe(false)
    expect(result.current.isDeleting).toBe(false)
    expect(result.current).toHaveProperty('error')
  })

  it('budgetSummary can be undefined before load', () => {
    mockGetBudgets.mockImplementation(() => new Promise(() => {}))
    mockGetBudgetSummary.mockImplementation(() => new Promise(() => {}))
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useBudget(), { wrapper: Wrapper })
    expect(result.current.budgetSummary).toBeUndefined()
  })
})
