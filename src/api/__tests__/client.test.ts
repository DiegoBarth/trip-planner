import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiGet, apiPost } from '../client'

describe('api/client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  describe('apiGet', () => {
    it('returns parsed JSON on success', async () => {
      const data = { success: true, data: [1, 2] }
        ; (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
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
      ; (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response('', { status: 500 })
      )
      await expect(apiGet({ action: 'x' })).rejects.toThrow('Erro na API')
    })

    it('throws on network error', async () => {
      ; (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Failed to fetch'))
      await expect(apiGet({ action: 'x' })).rejects.toThrow('Sem conexão')
    })

    it('throws on abort/timeout', async () => {
      const err = new Error('aborted')
      err.name = 'AbortError'
        ; (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(err)
      await expect(apiGet({ action: 'x' })).rejects.toThrow('demorou demais')
    })
  })

  describe('apiPost', () => {
    it('returns parsed JSON on success', async () => {
      const data = { success: true, data: { id: 1 } }
        ; (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
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
      ; (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        new Response('Conflict', { status: 409 })
      )
      await expect(
        apiPost({ action: 'postErrorAction', data: {} })
      ).rejects.toThrow('Conflict')
    })

    it('throws on rate limit when same action is sent twice within limit', async () => {
      ; (globalThis.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      await apiPost({ action: 'rateLimitAction', data: {} })
      await expect(
        apiPost({ action: 'rateLimitAction', data: {} })
      ).rejects.toThrow('Aguarde um instante')
    })
  })

  describe('api/client - missing coverage', () => {
    beforeEach(() => {
      vi.resetModules()
      vi.stubGlobal('fetch', vi.fn())
    })

    it('sets X-CSRF-Token header if meta exists', async () => {
      const meta = document.createElement('meta')
      meta.name = 'csrf-token'
      meta.content = 'csrf123'
      document.head.appendChild(meta)

      const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      )

      const clientModule = await import('../client')
      await clientModule.apiGet({ action: 'csrfTest' })

      const options = fetchMock.mock.calls[0][1]!
      expect(options.headers.get('X-CSRF-Token')).toBe('csrf123')

      document.head.removeChild(meta)
    })

    it('throws generic error when non-Error is thrown in apiGet', async () => {
      const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>
      fetchMock.mockRejectedValueOnce('string error')
      const clientModule = await import('../client')
      await expect(clientModule.apiGet({ action: 'x' })).rejects.toThrow('Erro ao conectar com o servidor.')
    })

    it('throws generic error when non-Error is thrown in apiPost', async () => {
      const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>
      fetchMock.mockRejectedValueOnce('random error')
      const clientModule = await import('../client')
      await expect(clientModule.apiPost({ action: 'y' })).rejects.toThrow('Erro ao conectar com o servidor.')
    })
  })

  describe('api/client - additional coverage', () => {
    beforeEach(() => {
      vi.resetModules()
      vi.stubGlobal('fetch', vi.fn())
    })

    it('getCsrfToken returns null if document is undefined', async () => {
      const originalDocument = globalThis.document
      // @ts-ignore
      delete globalThis.document

      const clientModule = await import('../client')
      // @ts-ignore
      expect(clientModule.getCsrfToken()).toBeNull()

      globalThis.document = originalDocument
    })

    it('apiPost uses default action "POST" when body.action is not a string', async () => {
      const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      )

      const clientModule = await import('../client')
      const result = await clientModule.apiPost({ data: {} })
      expect(result).toEqual({ success: true })

      const options = fetchMock.mock.calls[0][1]!
      expect(options.body).toContain('"data"')
    })
  })
})