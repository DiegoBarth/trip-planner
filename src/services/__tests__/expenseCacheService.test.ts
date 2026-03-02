import { describe, it, expect } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import {
  updateExpenseCacheOnCreate,
  updateExpenseCacheOnUpdate,
  updateExpenseCacheOnDelete,
} from '../expenseCacheService'
import type { Expense } from '@/types/Expense'

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 1,
    description: 'Test',
    amount: 100,
    currency: 'BRL',
    amountInBRL: 100,
    category: 'food',
    budgetOrigin: 'Casal',
    date: '2025-02-14',
    country: 'japan',
    ...overrides,
  }
}

describe('expenseCacheService', () => {
  it('updateExpenseCacheOnCreate appends new expense', () => {
    const client = new QueryClient()
    client.setQueryData(['expenses'], [makeExpense({ id: 1 })])
    updateExpenseCacheOnCreate(client, makeExpense({ id: 2, description: 'New' }))
    const data = client.getQueryData<Expense[]>(['expenses'])
    expect(data).toHaveLength(2)
    expect(data?.map(e => e.id)).toEqual([1, 2])
  })

  it('updateExpenseCacheOnCreate sets single item when cache was empty', () => {
    const client = new QueryClient()
    updateExpenseCacheOnCreate(client, makeExpense({ id: 1 }))
    expect(client.getQueryData(['expenses'])).toEqual([makeExpense({ id: 1 })])
  })

  it('updateExpenseCacheOnUpdate replaces matching expense', () => {
    const client = new QueryClient()
    const prev = makeExpense({ id: 1, amount: 100 })
    client.setQueryData(['expenses'], [prev])
    updateExpenseCacheOnUpdate(client, prev, makeExpense({ id: 1, amount: 200 }))
    const data = client.getQueryData<Expense[]>(['expenses'])
    expect(data?.[0].amount).toBe(200)
  })

  it('updateExpenseCacheOnDelete removes expense and decrements higher ids', () => {
    const client = new QueryClient()
    client.setQueryData(['expenses'], [
      makeExpense({ id: 1 }),
      makeExpense({ id: 2 }),
      makeExpense({ id: 3, description: 'Third' }),
    ])
    updateExpenseCacheOnDelete(client, 2)
    const data = client.getQueryData<Expense[]>(['expenses'])
    expect(data).toHaveLength(2)
    expect(data?.map(e => e.id).sort()).toEqual([1, 2])
    expect(data?.find(e => e.description === 'Third')?.id).toBe(2)
  })
})
