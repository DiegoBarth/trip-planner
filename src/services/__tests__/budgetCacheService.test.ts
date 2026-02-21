import { describe, it, expect } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import {
  updateBudgetCacheOnCreate,
  updateBudgetCacheOnUpdate,
  updateBudgetCacheOnDelete,
} from '../budgetCacheService'

function makeBudget(overrides: Partial<{ id: number; origin: string; amount: number }> = {}) {
  return {
    id: 1,
    origin: 'Casal' as const,
    description: 'x',
    amount: 1000,
    date: '2025-02-14',
    ...overrides,
  } as import('@/types/Budget').Budget
}

describe('budgetCacheService', () => {
  it('updateBudgetCacheOnCreate appends new budget', () => {
    const client = new QueryClient()
    client.setQueryData(['budgets'], [makeBudget({ id: 1 })])
    updateBudgetCacheOnCreate(client, makeBudget({ id: 2 }))
    const data = client.getQueryData<import('@/types/Budget').Budget[]>(['budgets'])
    expect(data).toHaveLength(2)
    expect(data?.map((b) => b.id)).toEqual([1, 2])
  })

  it('updateBudgetCacheOnCreate sets single item when cache was empty', () => {
    const client = new QueryClient()
    updateBudgetCacheOnCreate(client, makeBudget({ id: 1 }))
    expect(client.getQueryData(['budgets'])).toEqual([makeBudget({ id: 1 })])
  })

  it('updateBudgetCacheOnUpdate replaces matching budget', () => {
    const client = new QueryClient()
    const prev = makeBudget({ id: 1, amount: 100 })
    client.setQueryData(['budgets'], [prev])
    updateBudgetCacheOnUpdate(client, prev, makeBudget({ id: 1, amount: 200 }))
    const data = client.getQueryData<import('@/types/Budget').Budget[]>(['budgets'])
    expect(data?.[0].amount).toBe(200)
  })

  it('updateBudgetCacheOnDelete removes budget and decrements higher ids', () => {
    const client = new QueryClient()
    const b3 = makeBudget({ id: 3, amount: 300 })
    client.setQueryData(['budgets'], [
      makeBudget({ id: 1 }),
      makeBudget({ id: 2 }),
      b3,
    ])
    updateBudgetCacheOnDelete(client, 2)
    const data = client.getQueryData<import('@/types/Budget').Budget[]>(['budgets'])
    expect(data).toHaveLength(2)
    expect(data?.map((b) => b.id).sort()).toEqual([1, 2])
    expect(data?.find((b) => b.amount === 300)?.id).toBe(2)
  })
})
