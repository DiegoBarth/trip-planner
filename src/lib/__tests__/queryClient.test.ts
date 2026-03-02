import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'

const CACHE_PREFIX = 'rq_v1_'

function mockLocalStorage() {
  const store: Record<string, string> = {}

  const localStorageMock: any = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
      localStorageMock[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
      delete localStorageMock[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((k) => {
        delete store[k]
        delete localStorageMock[k]
      })
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() {
      return Object.keys(store).length
    },
  }

  vi.stubGlobal('localStorage', localStorageMock)

  return store
}

describe('queryClient cache behavior', () => {
  beforeEach(() => {
    vi.resetModules()
    mockLocalStorage()
    vi.spyOn(console, 'warn').mockImplementation(() => { })
  })

  it('loads valid cache from localStorage', async () => {
    const now = Date.now()

    localStorage.setItem(
      CACHE_PREFIX + '["test"]',
      JSON.stringify({
        queryKey: ['test'],
        data: { ok: true },
        dataUpdatedAt: now,
      })
    )

    const mod = await import('../queryClient')
    const client = mod.queryClient

    expect(client.getQueryData(['test'])).toEqual({ ok: true })
  })

  it('removes expired cache', async () => {
    const old = Date.now() - 2 * 60 * 60 * 1000 // 2h

    localStorage.setItem(
      CACHE_PREFIX + '["expired"]',
      JSON.stringify({
        queryKey: ['expired'],
        data: { old: true },
        dataUpdatedAt: old,
      })
    )

    await import('../queryClient')

    expect(localStorage.removeItem).toHaveBeenCalled()
  })

  it('removes invalid JSON cache', async () => {
    localStorage.setItem(CACHE_PREFIX + '["bad"]', 'invalid-json')

    await import('../queryClient')

    expect(localStorage.removeItem).toHaveBeenCalled()
  })

  it('persists cache on successful query update', async () => {
    const mod = await import('../queryClient')
    const client: QueryClient = mod.queryClient

    client.setQueryData(['persist'], { ok: 1 })

    client.getQueryCache().find({ queryKey: ['persist'] })?.setState({
      data: { ok: 1 },
      dataUpdatedAt: Date.now(),
      status: 'success',
      fetchStatus: 'idle',
    } as any)

    expect(localStorage.setItem).toHaveBeenCalled()
  })

  it('handles quota exceeded error gracefully', async () => {
    vi.stubGlobal(
      'localStorage',
      {
        getItem: vi.fn(),
        removeItem: vi.fn(),
        key: vi.fn(),
        clear: vi.fn(),
        get length() {
          return 0
        },
        setItem: vi.fn(() => {
          const err = new DOMException('Quota exceeded', 'QuotaExceededError')
          throw err
        }),
      } as any
    )

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

    const mod = await import('../queryClient')
    const client: QueryClient = mod.queryClient

    client.setQueryData(['quota'], { x: 1 })

    client.getQueryCache().find({ queryKey: ['quota'] })?.setState({
      data: { x: 1 },
      dataUpdatedAt: Date.now(),
      status: 'success',
      fetchStatus: 'idle',
    } as any)

    expect(warnSpy).toHaveBeenCalled()
  })

  it('handles unexpected error while loading cache', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

    mockLocalStorage()

    vi.spyOn(Object, 'keys').mockImplementationOnce(() => {
      throw new Error('boom')
    })

    await import('../queryClient')

    expect(warnSpy).toHaveBeenCalledWith(
      '[queryClient] Erro ao carregar cache do localStorage:',
      expect.any(Error)
    )
  })
})

describe('createQueryClient', () => {
  it('returns a new QueryClient instance each time', async () => {
    const { createQueryClient } = await import('../queryClient')
    const a = createQueryClient()
    const b = createQueryClient()

    expect(a).not.toBe(b)
  })

  it('has query and mutation cache', async () => {
    const { createQueryClient } = await import('../queryClient')
    const client = createQueryClient()

    expect(client.getQueryCache()).toBeDefined()
    expect(client.getMutationCache()).toBeDefined()
  })
})