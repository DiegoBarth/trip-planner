import { describe, it, expect } from 'vitest'
import { createQueryClient } from '../queryClient'

describe('createQueryClient', () => {
  it('returns a new QueryClient instance each time', () => {
    const a = createQueryClient()
    const b = createQueryClient()
    expect(a).not.toBe(b)
    expect(a).toBeDefined()
    expect(b).toBeDefined()
  })

  it('returns an object with getQueryCache and getMutationCache', () => {
    const client = createQueryClient()
    expect(client.getQueryCache()).toBeDefined()
    expect(client.getMutationCache()).toBeDefined()
  })
})
