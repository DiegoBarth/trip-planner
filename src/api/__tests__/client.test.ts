import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiGet, apiPost } from '../client'

describe('api/client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  describe('apiGet', () => {
    it('returns parsed JSON on success', async () => {
      const data = { success: true, data: [1, 2] }
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
      )
      const result = await apiGet<typeof data>({ action: 'getBudgets' })
      expect(result).toEqual(data)
      expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    })

    it('throws when response is not ok', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response('Server error', { status: 500 })
      )
      await expect(apiGet({ action: 'getBudgets' })).rejects.toThrow('Server error')
    })

    it('throws generic message when response text is empty', async () => {
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response('', { status: 500 })
      )
      await expect(apiGet({ action: 'x' })).rejects.toThrow('Erro na API')
    })

    it('throws on network error', async () => {
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Failed to fetch'))
      await expect(apiGet({ action: 'x' })).rejects.toThrow('Sem conexão')
    })

    it('throws on abort/timeout', async () => {
      const err = new Error('aborted')
      err.name = 'AbortError'
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(err)
      await expect(apiGet({ action: 'x' })).rejects.toThrow('demorou demais')
    })
  })

  describe('apiPost', () => {
    it('returns parsed JSON on success', async () => {
      const data = { success: true, data: { id: 1 } }
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
      )
      const result = await apiPost<typeof data>({ action: 'createBudget', data: {} })
      expect(result).toEqual(data)
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'POST', body: expect.any(String) })
      )
    })

    it('throws when response is not ok', async () => {
      ;(globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response('Conflict', { status: 409 })
      )
      await expect(
        apiPost({ action: 'postErrorAction', data: {} })
      ).rejects.toThrow('Conflict')
    })

    it('throws on rate limit when same action is sent twice within limit', async () => {
      ;(globalThis.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      await apiPost({ action: 'rateLimitAction', data: {} })
      await expect(
        apiPost({ action: 'rateLimitAction', data: {} })
      ).rejects.toThrow('Aguarde um instante')
    })
  })
})
