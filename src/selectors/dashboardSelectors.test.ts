import { describe, it, expect } from 'vitest'
import {
  selectTotalSpent,
  selectExpensesByCategory,
  selectBudgetByOrigin,
  selectAttractionStatus,
  calculateDaysOfTrip,
} from './dashboardSelectors'

describe('selectTotalSpent', () => {
  it('returns 0 for empty array', () => {
    expect(selectTotalSpent([])).toBe(0)
  })
  it('sums amountInBRL of expenses', () => {
    const expenses = [
      { amountInBRL: 100 } as import('@/types/Expense').Expense,
      { amountInBRL: 50 } as import('@/types/Expense').Expense,
    ]
    expect(selectTotalSpent(expenses)).toBe(150)
  })
})

describe('selectExpensesByCategory', () => {
  it('returns empty array for no expenses', () => {
    expect(selectExpensesByCategory([])).toEqual([])
  })
  it('groups by category and sums amountInBRL', () => {
    const expenses = [
      { category: 'food' as const, amountInBRL: 100 } as import('@/types/Expense').Expense,
      { category: 'food' as const, amountInBRL: 50 } as import('@/types/Expense').Expense,
      { category: 'transport' as const, amountInBRL: 80 } as import('@/types/Expense').Expense,
    ]
    const result = selectExpensesByCategory(expenses)
    expect(result).toHaveLength(2)
    const food = result.find((r) => r.category === 'food')
    const transport = result.find((r) => r.category === 'transport')
    expect(food?.total).toBe(150)
    expect(transport?.total).toBe(80)
  })
})

describe('selectBudgetByOrigin', () => {
  it('returns budget and spent per origin', () => {
    const budgets = [
      { origin: 'Casal' as const, amount: 5000 } as import('@/types/Budget').Budget,
    ]
    const expenses = [
      { budgetOrigin: 'Casal' as const, amountInBRL: 1000 } as import('@/types/Expense').Expense,
    ]
    const result = selectBudgetByOrigin(budgets, expenses)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      origin: 'Casal',
      totalBudget: 5000,
      spent: 1000,
      remaining: 4000,
    })
  })
})

describe('selectAttractionStatus', () => {
  it('counts total, visited, and pending reservation', () => {
    const attractions = [
      { visited: true, needsReservation: false } as import('@/types/Attraction').Attraction,
      { visited: false, needsReservation: true, reservationStatus: 'pending' } as import('@/types/Attraction').Attraction,
      { visited: false, needsReservation: true, reservationStatus: 'confirmed' } as import('@/types/Attraction').Attraction,
    ]
    const result = selectAttractionStatus(attractions)
    expect(result.total).toBe(3)
    expect(result.visited).toBe(1)
    expect(result.pendingReservation).toBe(1)
  })
})

describe('calculateDaysOfTrip', () => {
  it('returns 0 for empty attractions', () => {
    expect(calculateDaysOfTrip([])).toBe(0)
  })
  it('returns 1 for single date', () => {
    const attractions = [
      { date: '2025-03-01' } as import('@/types/Attraction').Attraction,
    ]
    expect(calculateDaysOfTrip(attractions)).toBe(1)
  })
  it('returns day span for multiple dates', () => {
    const attractions = [
      { date: '2025-03-01' } as import('@/types/Attraction').Attraction,
      { date: '2025-03-03' } as import('@/types/Attraction').Attraction,
    ]
    expect(calculateDaysOfTrip(attractions)).toBe(3)
  })
})
