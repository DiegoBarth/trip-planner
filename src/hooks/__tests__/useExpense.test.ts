import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useExpense } from '../useExpense'
import { createQueryClientWrapper } from './wrapper'
import type { UpdateExpensePayload } from '@/api/expense'

const mockGetExpenses = vi.fn()
const mockCreateExpense = vi.fn()
const mockUpdateExpense = vi.fn()
const mockDeleteExpense = vi.fn()

vi.mock('@/api/expense', () => ({
  getExpenses: (...args: unknown[]) => mockGetExpenses(...args),
  createExpense: (...args: unknown[]) => mockCreateExpense(...args),
  updateExpense: (...args: unknown[]) => mockUpdateExpense(...args),
  deleteExpense: (...args: unknown[]) => mockDeleteExpense(...args),
}))

function makeExpense(
  overrides: Partial<{ id: number; country: string; amountInBRL: number; description: string }> = {}
) {
  return {
    id: 1,
    description: 'Test',
    amount: 100,
    currency: 'BRL' as const,
    amountInBRL: 100,
    category: 'food' as const,
    budgetOrigin: 'Casal' as const,
    date: '2025-02-14',
    country: 'japan' as const,
    ...overrides,
  }
}

describe('useExpense', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetExpenses.mockResolvedValue([])
  })

  it('returns expenses and loading state', async () => {
    const expenses = [makeExpense({ id: 1 }), makeExpense({ id: 2, country: 'japan' })]
    mockGetExpenses.mockResolvedValue(expenses)

    const Wrapper = createQueryClientWrapper([
      { queryKey: ['expenses'], data: expenses },
    ])

    const { result } = renderHook(() => useExpense('all'), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.expenses).toHaveLength(2)
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.createExpense).toBeDefined()
    expect(result.current.updateExpense).toBeDefined()
    expect(result.current.deleteExpense).toBeDefined()
  })

  it('filters expenses by country when country is not "all"', async () => {
    const expenses = [
      makeExpense({ id: 1, country: 'japan' }),
      makeExpense({ id: 2, country: 'south-korea' }),
    ]
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['expenses'], data: expenses },
    ])

    const { result } = renderHook(() => useExpense('japan'), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.expenses).toHaveLength(1)
      expect(result.current.expenses[0].country).toBe('japan')
    })
  })

  it('createExpense calls API and updates cache', async () => {
    const newExpense = makeExpense({ id: 99, description: 'New' })
    mockCreateExpense.mockResolvedValue(newExpense)

    const Wrapper = createQueryClientWrapper([
      { queryKey: ['expenses'], data: [] },
    ])

    const { result } = renderHook(() => useExpense('all'), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.expenses).toEqual([]))

    await result.current.createExpense({
      category: 'food',
      description: 'New',
      amount: 100,
      currency: 'BRL',
      amountInBRL: 100,
      budgetOrigin: 'Casal',
      date: '2025-02-14',
      country: 'japan',
    })

    expect(mockCreateExpense).toHaveBeenCalledTimes(1)
  })

  it('deleteExpense calls API', async () => {
    mockDeleteExpense.mockResolvedValue(undefined)
    const expenses = [makeExpense({ id: 1 })]
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['expenses'], data: expenses },
    ])

    const { result } = renderHook(() => useExpense('all'), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.expenses).toHaveLength(1))
    await result.current.deleteExpense(1)
    expect(mockDeleteExpense).toHaveBeenCalledWith(1)
  })

  it('updateExpense calls API with payload', async () => {
    const expense = makeExpense({ id: 1, description: 'Old' })
    const updated = makeExpense({ id: 1, description: 'Updated' })
    mockUpdateExpense.mockResolvedValue(updated)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['expenses'], data: [expense] }])
    const { result } = renderHook(() => useExpense('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.expenses).toHaveLength(1))
    await result.current.updateExpense({
      ...expense,
      description: 'Updated',
    } as UpdateExpensePayload)
    expect(mockUpdateExpense).toHaveBeenCalledTimes(1)
  })

  it('filters expenses with country general', async () => {
    const expenses = [
      makeExpense({ id: 1, country: 'general' }),
      makeExpense({ id: 2, country: 'japan' }),
    ]
    const Wrapper = createQueryClientWrapper([{ queryKey: ['expenses'], data: expenses }])
    const { result } = renderHook(() => useExpense('general'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.expenses).toHaveLength(1))
    expect(result.current.expenses[0].country).toBe('general')
  })

  it('exposes isCreating, isUpdating, isDeleting and error', async () => {
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useExpense('all'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isCreating).toBe(false)
    expect(result.current.isUpdating).toBe(false)
    expect(result.current.isDeleting).toBe(false)
    expect(result.current).toHaveProperty('error')
  })
})
