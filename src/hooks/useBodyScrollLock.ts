import { useEffect } from 'react'

/**
 * Global counter for stacked modals: scroll is restored only when the last lock is released.
 */
let lockCount = 0
let previousOverflow = ''

function acquireLock() {
  lockCount += 1
  if (lockCount === 1) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
}

function releaseLock() {
  lockCount = Math.max(0, lockCount - 1)
  if (lockCount === 0) {
    document.body.style.overflow = previousOverflow
  }
}

/**
 * Resets module-level lock state. Only used from unit tests to avoid cross-test leakage.
 */
export function resetBodyScrollLockForTests() {
  lockCount = 0
  previousOverflow = ''
}

/**
 * Prevents background page scroll while `locked` is true.
 * Use on full-screen modals/overlays.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    acquireLock()

    return () => {
      releaseLock()
    }
  }, [locked])
}
