import { describe, it, expect } from 'vitest'
import { budgetCreateSchema, budgetUpdateSchema } from '../budgetSchema'

const validBudget = {
  origin: 'Casal' as const,
  description: 'Orçamento inicial',
  amount: 5000,
  date: '2025-02-14',
}

describe('budgetCreateSchema', () => {
  it('accepts valid payload', () => {
    expect(budgetCreateSchema.safeParse(validBudget).success).toBe(true)
  })

  it('rejects empty description', () => {
    const result = budgetCreateSchema.safeParse({ ...validBudget, description: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid origin', () => {
    const result = budgetCreateSchema.safeParse({ ...validBudget, origin: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejects amount <= 0', () => {
    expect(budgetCreateSchema.safeParse({ ...validBudget, amount: 0 }).success).toBe(false)
  })
})

describe('budgetUpdateSchema', () => {
  it('accepts valid payload with id', () => {
    expect(budgetUpdateSchema.safeParse({ ...validBudget, id: 1 }).success).toBe(true)
  })

  it('rejects missing id', () => {
    expect(budgetUpdateSchema.safeParse(validBudget).success).toBe(false)
  })
})
