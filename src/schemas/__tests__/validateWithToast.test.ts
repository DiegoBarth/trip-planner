import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import { validateWithToast } from '../validateWithToast'

describe('validateWithToast', () => {
  const toast = { error: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('returns true and does not call toast when validation succeeds', () => {
    const schema = z.object({ name: z.string().min(1) })
    const data = { name: 'ok' }
    expect(validateWithToast(data, schema, toast)).toBe(true)
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('returns false and calls toast for each issue when validation fails', () => {
    const schema = z.object({
      name: z.string().min(1, 'Nome obrigatório'),
      age: z.number().min(0, 'Idade inválida'),
    })
    const data = { name: '', age: -1 }
    expect(validateWithToast(data, schema, toast)).toBe(false)
    expect(toast.error).not.toHaveBeenCalled()
    vi.advanceTimersByTime(0)
    expect(toast.error).toHaveBeenCalledTimes(2)
    expect(toast.error).toHaveBeenCalledWith('Nome obrigatório')
    expect(toast.error).toHaveBeenCalledWith('Idade inválida')
  })

  it('uses default message when issue has no message', () => {
    const schema = z.object({ x: z.number() })
    validateWithToast({ x: 'not a number' }, schema, toast)
    vi.advanceTimersByTime(0)
    expect(toast.error).toHaveBeenCalledWith(expect.any(String))
  })

  vi.useRealTimers()
})
