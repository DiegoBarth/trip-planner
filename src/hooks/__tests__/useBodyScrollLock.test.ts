import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBodyScrollLock, resetBodyScrollLockForTests } from '../useBodyScrollLock'

describe('useBodyScrollLock', () => {
  beforeEach(() => {
    resetBodyScrollLockForTests()
    document.body.style.overflow = ''
  })

  afterEach(() => {
    resetBodyScrollLockForTests()
    document.body.style.overflow = ''
  })

  it('does not change body overflow when locked is false', () => {
    document.body.style.overflow = 'scroll'

    renderHook(() => useBodyScrollLock(false))

    expect(document.body.style.overflow).toBe('scroll')
  })

  it('sets body overflow to hidden when locked is true', () => {
    renderHook(() => useBodyScrollLock(true))

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores previous overflow when hook unmounts', () => {
    document.body.style.overflow = 'auto'

    const { unmount } = renderHook(() => useBodyScrollLock(true))

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('auto')
  })

  it('restores previous overflow when locked goes from true to false', () => {
    document.body.style.overflow = ''

    const { rerender } = renderHook(({ locked }: { locked: boolean }) => useBodyScrollLock(locked), {
      initialProps: { locked: true },
    })

    expect(document.body.style.overflow).toBe('hidden')

    rerender({ locked: false })

    expect(document.body.style.overflow).toBe('')
  })

  it('keeps overflow hidden until the last stacked lock is released', () => {
    const first = renderHook(() => useBodyScrollLock(true))
    expect(document.body.style.overflow).toBe('hidden')

    const second = renderHook(() => useBodyScrollLock(true))
    expect(document.body.style.overflow).toBe('hidden')

    first.unmount()
    expect(document.body.style.overflow).toBe('hidden')

    second.unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
