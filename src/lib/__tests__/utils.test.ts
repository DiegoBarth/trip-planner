import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn', () => {
  it('merges single class', () => {
    expect(cn('foo')).toBe('foo')
  })
  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toContain('foo')
    expect(cn('foo', 'bar')).toContain('bar')
  })
  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'block')).toContain('base')
    expect(cn('base', false && 'hidden', true && 'block')).toContain('block')
  })
  it('merges tailwind conflicts with twMerge', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })
})
