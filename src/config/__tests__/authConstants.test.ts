import { describe, it, expect } from 'vitest'
import {
  AUTH_TIMEOUT_MS,
  AUTH_REFRESH_INTERVAL_MS,
} from '../authConstants'

describe('auth constants', () => {
  it('AUTH_TIMEOUT_MS equals 7 days in milliseconds', () => {
    // 7 days * 24h * 60m * 60s * 1000ms
    const expected = 7 * 24 * 60 * 60 * 1000
    expect(AUTH_TIMEOUT_MS).toBe(expected)
  })

  it('AUTH_REFRESH_INTERVAL_MS equals 5 minutes in milliseconds', () => {
    // 5 minutes * 60s * 1000ms
    const expected = 5 * 60 * 1000
    expect(AUTH_REFRESH_INTERVAL_MS).toBe(expected)
  })

  it('refresh interval is smaller than timeout', () => {
    // Sanity check to prevent future regressions
    expect(AUTH_REFRESH_INTERVAL_MS).toBeLessThan(AUTH_TIMEOUT_MS)
  })
})