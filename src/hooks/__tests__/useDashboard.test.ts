import { describe, it, expect } from 'vitest'
import { useDashboard } from '../useDashboard'

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

function makeExpense(overrides: Partial<{ id: number; category: string; amountInBRL: number }> = {}) {
  return {
    id: 1,
    description: 'x',
    amount: 50,
    currency: 'BRL' as const,
    amountInBRL: 50,
    category: 'food' as const,
    budgetOrigin: 'Casal' as const,
    date: '2025-02-14',
    ...overrides,
  } as import('@/types/Expense').Expense
}

function makeAttraction(overrides: Partial<{ id: number; visited: boolean; needsReservation: boolean; reservationStatus: string; date: string }> = {}) {
  return {
    id: 1,
    name: 'A',
    country: 'japan' as const,
    city: 'Tokyo',
    date: '2025-03-01',
    type: 'temple' as const,
    visited: false,
    needsReservation: false,
    reservationStatus: undefined,
    couplePrice: 0,
    currency: 'JPY' as const,
    priceInBRL: 0,
    ...overrides,
  } as import('@/types/Attraction').Attraction
}

describe('useDashboard', () => {
  it('returns stats with zero values when given empty arrays', () => {
    const result = useDashboard({ budgets: [], expenses: [], attractions: [] })
    expect(result.stats?.totalBudget).toBe(0)
    expect(result.stats?.totalSpent).toBe(0)
    expect(result.stats?.remaining).toBe(0)
    expect(result.stats?.daysOfTrip).toBe(0)
    expect(result.stats?.expensesByCategory).toEqual([])
    expect(result.stats?.budgetByOrigin).toEqual([])
    expect(result.stats?.attractionStatus).toEqual({
      total: 0,
      visited: 0,
      pendingReservation: 0,
      visitedPercentage: 0,
    })
  })

  it('sums totalBudget from budgets', () => {
    const budgets = [
      makeBudget({ id: 1, amount: 1000 }),
      makeBudget({ id: 2, amount: 2000 }),
    ]
    const result = useDashboard({ budgets, expenses: [], attractions: [] })
    expect(result.stats?.totalBudget).toBe(3000)
  })

  it('sums totalSpent from expenses (amountInBRL)', () => {
    const expenses = [
      makeExpense({ id: 1, amountInBRL: 100 }),
      makeExpense({ id: 2, amountInBRL: 50 }),
    ]
    const result = useDashboard({ budgets: [], expenses, attractions: [] })
    expect(result.stats?.totalSpent).toBe(150)
    expect(result.stats?.remaining).toBe(-150)
  })

  it('computes remaining as totalBudget - totalSpent', () => {
    const budgets = [makeBudget({ amount: 5000 })]
    const expenses = [makeExpense({ amountInBRL: 1000 })]
    const result = useDashboard({ budgets, expenses, attractions: [] })
    expect(result.stats?.remaining).toBe(4000)
  })

  it('computes attractionStatus (visited, pendingReservation, visitedPercentage)', () => {
    const attractions = [
      makeAttraction({ id: 1, visited: true }),
      makeAttraction({ id: 2, visited: false, needsReservation: true, reservationStatus: 'pending' }),
      makeAttraction({ id: 3, visited: false }),
    ]
    const result = useDashboard({ budgets: [], expenses: [], attractions })
    expect(result.stats?.attractionStatus.total).toBe(3)
    expect(result.stats?.attractionStatus.visited).toBe(1)
    expect(result.stats?.attractionStatus.pendingReservation).toBe(1)
    expect(result.stats?.attractionStatus.visitedPercentage).toBeCloseTo(100 / 3)
  })

  it('returns expensesByCategory and budgetByOrigin', () => {
    const budgets = [makeBudget({ origin: 'Casal', amount: 1000 })]
    const expenses = [
      makeExpense({ category: 'food', amountInBRL: 100 }),
      makeExpense({ category: 'food', amountInBRL: 50 }),
    ]
    const result = useDashboard({ budgets, expenses, attractions: [] })
    expect(result.stats?.expensesByCategory).toHaveLength(1)
    expect(result.stats?.expensesByCategory[0]).toEqual({ category: 'food', total: 150 })
    expect(result.stats?.budgetByOrigin).toHaveLength(1)
    expect(result.stats?.budgetByOrigin[0].origin).toBe('Casal')
    expect(result.stats?.budgetByOrigin[0].totalBudget).toBe(1000)
    expect(result.stats?.budgetByOrigin[0].spent).toBe(150)
    expect(result.stats?.budgetByOrigin[0].remaining).toBe(850)
  })
})
