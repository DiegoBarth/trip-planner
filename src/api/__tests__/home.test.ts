import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as clientModule from '@/api/client'
import { verifyEmailAuthorization } from '@/api/home'

describe('verifyEmailAuthorization', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiGet with correct action and email', async () => {
    const mockResponse = { success: true, authorized: true }
    vi.spyOn(clientModule, 'apiGet').mockResolvedValueOnce(mockResponse)

    const email = 'test@example.com'
    const result = await verifyEmailAuthorization(email)

    expect(clientModule.apiGet).toHaveBeenCalledWith({
      action: 'verifyEmailAuthorization',
      email
    })
    expect(result).toEqual(mockResponse)
  })

  it('propagates error from apiGet', async () => {
    vi.spyOn(clientModule, 'apiGet').mockRejectedValueOnce(new Error('API failed'))

    await expect(verifyEmailAuthorization('fail@example.com')).rejects.toThrow('API failed')
  })
})