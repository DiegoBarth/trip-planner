import { describe, it, expect } from 'vitest'
import { expenseCreateSchema, expenseUpdateSchema } from '../expenseSchema'

const validExpense = {
  category: 'food' as const,
  description: 'Almoço',
  amount: 100,
  currency: 'BRL' as const,
  amountInBRL: 100,
  budgetOrigin: 'Casal' as const,
  date: '2025-02-14',
  country: 'japan' as const,
}

describe('expenseCreateSchema', () => {
  it('accepts valid payload', () => {
    expect(expenseCreateSchema.safeParse(validExpense).success).toBe(true)
  })

  it('rejects empty description', () => {
    const result = expenseCreateSchema.safeParse({ ...validExpense, description: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.message.includes('Descrição'))).toBe(true)
    }
  })

  it('rejects invalid category', () => {
    const result = expenseCreateSchema.safeParse({ ...validExpense, category: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejects amount <= 0', () => {
    expect(expenseCreateSchema.safeParse({ ...validExpense, amount: 0 }).success).toBe(false)
    expect(expenseCreateSchema.safeParse({ ...validExpense, amount: -1 }).success).toBe(false)
  })

  it('accepts optional notes and receiptUrl', () => {
    expect(expenseCreateSchema.safeParse({ ...validExpense, notes: 'x', receiptUrl: 'https://x.com' }).success).toBe(true)
  })
})

describe('expenseUpdateSchema', () => {
  it('accepts valid payload with id', () => {
    expect(expenseUpdateSchema.safeParse({ ...validExpense, id: 1 }).success).toBe(true)
  })

  it('rejects missing id', () => {
    const result = expenseUpdateSchema.safeParse(validExpense)
    expect(result.success).toBe(false)
  })
})
