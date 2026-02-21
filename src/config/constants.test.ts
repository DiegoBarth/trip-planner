import { describe, it, expect } from 'vitest'
import { getCategoryFromLabel, getBudgetOriginFromLabel, EXPENSE_CATEGORIES, BUDGET_ORIGINS } from './constants'

describe('getCategoryFromLabel', () => {
  it('returns category key for matching label', () => {
    expect(getCategoryFromLabel('Alimentação')).toBe('food')
    expect(getCategoryFromLabel('Transporte')).toBe('transport')
  })
  it('returns "other" for unknown label', () => {
    expect(getCategoryFromLabel('Unknown')).toBe('other')
  })
  it('returns "other" for empty string', () => {
    expect(getCategoryFromLabel('')).toBe('other')
  })
})

describe('getBudgetOriginFromLabel', () => {
  it('returns origin key for matching label', () => {
    expect(getBudgetOriginFromLabel('Diego')).toBe('Diego')
    expect(getBudgetOriginFromLabel('Casal')).toBe('Casal')
  })
  it('returns "Casal" for unknown label', () => {
    expect(getBudgetOriginFromLabel('Unknown')).toBe('Casal')
  })
})

describe('constants shape', () => {
  it('EXPENSE_CATEGORIES has expected keys', () => {
    expect(Object.keys(EXPENSE_CATEGORIES)).toContain('food')
    expect(Object.keys(EXPENSE_CATEGORIES)).toContain('other')
  })
  it('BUDGET_ORIGINS has expected keys', () => {
    expect(Object.keys(BUDGET_ORIGINS)).toContain('Casal')
  })
})
