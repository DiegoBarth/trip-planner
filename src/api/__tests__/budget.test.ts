import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import {
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgets,
  getBudgetSummary,
  type CreateBudgetPayload,
  type UpdateBudgetPayload
} from '@/api/budget'
import { apiGet, apiPost } from '@/api/client'
import { parseBudgets } from '@/api/schemas'
import type { Budget, BudgetSummary } from '@/types/Budget'

vi.mock('@/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn()
}))

vi.mock('@/api/schemas', () => ({
  parseBudgets: vi.fn((data) => data)
}))

const mockBudget: Budget = {
  id: 1,
  origin: 'Diego',
  description: 'Aluguel',
  amount: 1500,
  date: '2026-03-05'
}

const mockSummary: BudgetSummary = {
  totalBudget: 5000,
  totalSpent: 1500,
  remainingBalance: 3500,
  byOrigin: {
    Personal: { totalBudget: 5000, totalSpent: 1500, remainingBalance: 3500 }
  }
}

describe('Budget API - Success Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createBudget should return created budget', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true, data: mockBudget })
    const payload: CreateBudgetPayload = {
      origin: 'Diego',
      description: 'Aluguel',
      amount: 1500,
      date: '2026-03-05'
    }
    const result = await createBudget(payload)
    expect(result).toEqual(mockBudget)
    expect(apiPost).toHaveBeenCalledWith({ action: 'createBudget', data: payload })
  })

  it('updateBudget should return updated budget', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true, data: mockBudget })
    const payload: UpdateBudgetPayload = { ...mockBudget }
    const result = await updateBudget(payload)
    expect(result).toEqual(mockBudget)
    expect(apiPost).toHaveBeenCalledWith({ action: 'updateBudget', data: payload })
  })

  it('deleteBudget should succeed when API returns success', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true })
    await expect(deleteBudget(1)).resolves.toBeUndefined()
    expect(apiPost).toHaveBeenCalledWith({ action: 'deleteBudget', id: 1 })
  })

  it('getBudgets should return parsed budgets', async () => {
    ; (apiGet as Mock).mockResolvedValue({ success: true, data: [mockBudget] })
    const result = await getBudgets()
    expect(parseBudgets).toHaveBeenCalledWith([mockBudget])
    expect(result).toEqual([mockBudget])
  })

  it('getBudgetSummary should return budget summary', async () => {
    ; (apiGet as Mock).mockResolvedValue({ success: true, data: mockSummary })
    const result = await getBudgetSummary()
    expect(result).toEqual(mockSummary)
  })
})

describe('Budget API - Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createBudget should throw default error on failure', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false })
    const payload: CreateBudgetPayload = {
      origin: 'Diego',
      description: 'Aluguel',
      amount: 1500,
      date: '2026-03-05'
    }
    await expect(createBudget(payload)).rejects.toThrow('Failed to create budget')
  })

  it('updateBudget should throw default error on failure', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false })
    const payload: UpdateBudgetPayload = { ...mockBudget }
    await expect(updateBudget(payload)).rejects.toThrow('Failed to update budget')
  })

  it('updateBudget should throw default error if success true but no data', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true })
    const payload: UpdateBudgetPayload = { ...mockBudget }
    await expect(updateBudget(payload)).rejects.toThrow('Failed to update budget')
  })

  it('deleteBudget should throw default error on failure', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false })
    await expect(deleteBudget(1)).rejects.toThrow('Failed to delete budget')
  })

  it('getBudgets should throw default error on failure', async () => {
    ; (apiGet as Mock).mockResolvedValue({ success: false })
    await expect(getBudgets()).rejects.toThrow('Failed to fetch budgets')
  })

  it('getBudgetSummary should throw default error on failure', async () => {
    ; (apiGet as Mock).mockResolvedValue({ success: false })
    await expect(getBudgetSummary()).rejects.toThrow('Failed to fetch balance')
  })
})