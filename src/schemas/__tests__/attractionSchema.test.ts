import { describe, it, expect } from 'vitest'
import { attractionCreateSchema, attractionUpdateSchema } from '../attractionSchema'

const validAttraction = {
  name: 'Templo Senso-ji',
  country: 'japan' as const,
  city: 'Tóquio',
  date: '2025-03-01',
  type: 'temple' as const,
  visited: false,
  needsReservation: false,
  couplePrice: 1,
  currency: 'JPY' as const,
  priceInBRL: 0,
}

describe('attractionCreateSchema', () => {
  it('accepts valid payload', () => {
    expect(attractionCreateSchema.safeParse(validAttraction).success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = attractionCreateSchema.safeParse({ ...validAttraction, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty city', () => {
    const result = attractionCreateSchema.safeParse({ ...validAttraction, city: '  ' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid type', () => {
    const result = attractionCreateSchema.safeParse({ ...validAttraction, type: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejects negative couplePrice', () => {
    expect(attractionCreateSchema.safeParse({ ...validAttraction, couplePrice: -1 }).success).toBe(false)
  })

  it('accepts optional fields', () => {
    expect(attractionCreateSchema.safeParse({
      ...validAttraction,
      region: 'Asakusa',
      notes: 'x',
    }).success).toBe(true)
  })
})

describe('attractionUpdateSchema', () => {
  it('accepts valid payload with id', () => {
    expect(attractionUpdateSchema.safeParse({ ...validAttraction, id: 1 }).success).toBe(true)
  })

  it('rejects missing id', () => {
    expect(attractionUpdateSchema.safeParse(validAttraction).success).toBe(false)
  })
})
