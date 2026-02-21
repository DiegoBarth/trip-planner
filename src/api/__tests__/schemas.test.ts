import { describe, it, expect } from 'vitest'
import {
  parseAttractions,
  parseBudgets,
  parseExpenses,
  parseReservations,
  parseChecklistItems,
} from '../schemas'

describe('parseAttractions', () => {
  it('parses valid array of attractions', () => {
    const data = [{
      id: 1,
      name: 'Templo',
      country: 'japan',
      city: 'Tokyo',
      day: 1,
      date: '2025-03-01',
      dayOfWeek: 'Saturday',
      type: 'temple',
      order: 0,
      visited: false,
      needsReservation: false,
      couplePrice: 100,
      currency: 'JPY',
      priceInBRL: 5,
    }]
    expect(parseAttractions(data)).toEqual(data)
  })

  it('throws on invalid data', () => {
    expect(() => parseAttractions(null)).toThrow('formato inválido (atrações)')
    expect(() => parseAttractions([{ id: 1 }])).toThrow('formato inválido (atrações)')
  })
})

describe('parseBudgets', () => {
  it('parses valid array of budgets', () => {
    const data = [{
      id: 1,
      origin: 'Casal',
      description: 'Orçamento',
      amount: 5000,
      date: '2025-02-14',
    }]
    expect(parseBudgets(data)).toEqual(data)
  })

  it('throws on invalid data', () => {
    expect(() => parseBudgets(null)).toThrow('formato inválido (orçamentos)')
    expect(() => parseBudgets([{ id: 1 }])).toThrow('formato inválido (orçamentos)')
  })
})

describe('parseExpenses', () => {
  it('parses valid array of expenses', () => {
    const data = [{
      id: 1,
      description: 'Almoço',
      amount: 100,
      currency: 'BRL',
      amountInBRL: 100,
      category: 'food',
      budgetOrigin: 'Casal',
      date: '2025-02-14',
    }]
    expect(parseExpenses(data)).toEqual(data)
  })

  it('throws on invalid data', () => {
    expect(() => parseExpenses(null)).toThrow('formato inválido (gastos)')
    expect(() => parseExpenses([{ id: 1 }])).toThrow('formato inválido (gastos)')
  })
})

describe('parseReservations', () => {
  it('parses valid array of reservations', () => {
    const data = [{
      id: 1,
      type: 'flight',
      title: 'Voo',
      status: 'pending',
    }]
    expect(parseReservations(data)).toEqual(data)
  })

  it('throws on invalid data', () => {
    expect(() => parseReservations(null)).toThrow('formato inválido (reservas)')
    expect(() => parseReservations([{ id: 1 }])).toThrow('formato inválido (reservas)')
  })
})

describe('parseChecklistItems', () => {
  it('parses valid array of checklist items', () => {
    const data = [{
      id: 1,
      description: 'Passaporte',
      category: 'documents',
      isPacked: false,
    }]
    expect(parseChecklistItems(data)).toEqual(data)
  })

  it('throws on invalid data', () => {
    expect(() => parseChecklistItems(null)).toThrow('formato inválido (checklist)')
    expect(() => parseChecklistItems([{ id: 1 }])).toThrow('formato inválido (checklist)')
  })
})
