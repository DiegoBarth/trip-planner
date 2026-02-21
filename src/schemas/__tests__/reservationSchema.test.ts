import { describe, it, expect } from 'vitest'
import { reservationCreateSchema, reservationUpdateSchema } from '../reservationSchema'

const validReservation = {
  type: 'flight' as const,
  title: 'Voo SP → Tóquio',
  date: '2025-02-20',
  endDate: '2025-03-10',
  provider: 'LATAM',
  location: 'Aeroporto de Narita',
  status: 'pending' as const,
  country: 'japan' as const,
}

describe('reservationCreateSchema', () => {
  it('accepts valid payload', () => {
    expect(reservationCreateSchema.safeParse(validReservation).success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = reservationCreateSchema.safeParse({ ...validReservation, title: '  ' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid type', () => {
    const result = reservationCreateSchema.safeParse({ ...validReservation, type: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status', () => {
    const result = reservationCreateSchema.safeParse({ ...validReservation, status: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields', () => {
    expect(reservationCreateSchema.safeParse({
      ...validReservation,
      description: 'x',
      confirmationCode: 'ABC',
    }).success).toBe(true)
  })
})

describe('reservationUpdateSchema', () => {
  it('accepts valid payload with id', () => {
    expect(reservationUpdateSchema.safeParse({ ...validReservation, id: 1 }).success).toBe(true)
  })

  it('rejects missing id', () => {
    expect(reservationUpdateSchema.safeParse(validReservation).success).toBe(false)
  })
})
