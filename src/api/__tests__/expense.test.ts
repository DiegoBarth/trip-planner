import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenses,
} from '@/api/expense'
import * as clientModule from '@/api/client'
import type { Expense } from '@/types/Expense'

describe('Expenses API - success scenarios', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('createExpense returns created expense', async () => {
    const payload = { id: 1, description: 'Test', amount: 100, currency: 'BRL', amountInBRL: 100, category: 'food', budgetOrigin: 'Diego', date: '2026-01-01' } as Expense
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: true, data: payload })

    const result = await createExpense(payload)
    expect(result).toEqual(payload)
  })

  it('updateExpense returns updated expense', async () => {
    const payload = { id: 1, description: 'Updated', amount: 200, currency: 'BRL', amountInBRL: 200, category: 'food', budgetOrigin: 'Diego', date: '2026-01-01' } as Expense
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: true, data: payload })

    const result = await updateExpense(payload)
    expect(result).toEqual(payload)
  })

  it('deleteExpense resolves when successful', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: true, data: null })

    await expect(deleteExpense(1)).resolves.toBeUndefined()
  })

  it('getExpenses returns parsed expenses array', async () => {
    const data: Expense[] = [
      { id: 1, description: 'Exp', amount: 100, currency: 'BRL', amountInBRL: 100, category: 'food', budgetOrigin: 'Diego', date: '2026-01-01' },
    ]
    vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce({ success: true, data })

    const result = await getExpenses()
    expect(result).toEqual(data)
  })

  it('getExpenses returns empty array if no data', async () => {
    vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce({ success: true })

    const result = await getExpenses()
    expect(result).toEqual([])
  })
})

describe('Expenses API - error scenarios', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('createExpense throws "Failed to create expense" when success=false and no message', async () => {
    const payload = { description: 'Test', amount: 100, currency: 'BRL', amountInBRL: 100, category: 'food', budgetOrigin: 'Diego', date: '2026-01-01' } as Expense
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false })

    await expect(createExpense(payload)).rejects.toThrow('Failed to create expense')
  })

  it('createExpense throws with API message if provided', async () => {
    const payload = { description: 'Test', amount: 100, currency: 'BRL', amountInBRL: 100, category: 'food', budgetOrigin: 'Diego', date: '2026-01-01' } as Expense
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false, message: 'Cannot create' })

    await expect(createExpense(payload)).rejects.toThrow('Cannot create')
  })

  it('updateExpense throws on failure', async () => {
    const payload = { id: 1, description: 'Fail', amount: 50, currency: 'BRL', amountInBRL: 50, category: 'food', budgetOrigin: 'Diego', date: '2026-01-01' } as Expense
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false })

    await expect(updateExpense(payload)).rejects.toThrow('Failed to update expense')
  })

  it('deleteExpense throws "Failed to delete expense" when success=false and no message', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false })

    await expect(deleteExpense(1)).rejects.toThrow('Failed to delete expense')
  })

  it('deleteExpense throws with API message if provided', async () => {
    vi.spyOn(clientModule, 'apiPost').mockResolvedValueOnce({ success: false, message: 'Cannot delete' })

    await expect(deleteExpense(1)).rejects.toThrow('Cannot delete')
  })
})