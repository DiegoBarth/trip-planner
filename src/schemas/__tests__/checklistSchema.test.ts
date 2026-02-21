import { describe, it, expect } from 'vitest'
import { checklistItemCreateSchema, checklistItemUpdateSchema } from '../checklistSchema'

const validItem = {
  category: 'documents' as const,
  description: 'Passaporte',
  isPacked: false,
  quantity: 1,
}

describe('checklistItemCreateSchema', () => {
  it('accepts valid payload', () => {
    expect(checklistItemCreateSchema.safeParse(validItem).success).toBe(true)
  })

  it('rejects empty description', () => {
    const result = checklistItemCreateSchema.safeParse({ ...validItem, description: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid category', () => {
    const result = checklistItemCreateSchema.safeParse({ ...validItem, category: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejects quantity < 1', () => {
    const result = checklistItemCreateSchema.safeParse({ ...validItem, quantity: 0 })
    expect(result.success).toBe(false)
  })

  it('accepts optional notes', () => {
    expect(checklistItemCreateSchema.safeParse({ ...validItem, notes: 'x' }).success).toBe(true)
  })
})

describe('checklistItemUpdateSchema', () => {
  it('accepts valid payload with id', () => {
    expect(checklistItemUpdateSchema.safeParse({ ...validItem, id: 1 }).success).toBe(true)
  })

  it('rejects missing id', () => {
    expect(checklistItemUpdateSchema.safeParse(validItem).success).toBe(false)
  })
})
