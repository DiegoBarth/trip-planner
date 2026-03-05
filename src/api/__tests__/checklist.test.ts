import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import {
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getChecklistItems,
  toggleChecklistItemPacked,
  type CreateChecklistItemPayload,
  type UpdateChecklistItemPayload
} from '@/api/checklist'
import type { ChecklistItem } from '@/types/ChecklistItem'
import { apiGet, apiPost } from '@/api/client'
import { parseChecklistItems } from '@/api/schemas'

vi.mock('@/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn()
}))

vi.mock('@/api/schemas', () => ({
  parseChecklistItems: vi.fn((data) => data)
}))

const mockItem: ChecklistItem = {
  id: 1,
  description: 'Passaporte',
  category: 'documents',
  isPacked: false,
  quantity: 1,
  notes: 'Verificar validade'
}

describe('Checklist API - Success Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createChecklistItem should return created item', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true, data: mockItem })
    const payload: CreateChecklistItemPayload = {
      category: 'documents',
      description: 'Passaporte',
      isPacked: false,
      quantity: 1,
      notes: 'Verificar validade'
    }
    const result = await createChecklistItem(payload)
    expect(result).toEqual(mockItem)
    expect(apiPost).toHaveBeenCalledWith({ action: 'createChecklistItem', data: payload })
  })

  it('updateChecklistItem should return updated item', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true, data: mockItem })
    const payload: UpdateChecklistItemPayload = { ...mockItem }
    const result = await updateChecklistItem(payload)
    expect(result).toEqual(mockItem)
    expect(apiPost).toHaveBeenCalledWith({ action: 'updateChecklistItem', data: payload })
  })

  it('deleteChecklistItem should succeed', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true })
    await expect(deleteChecklistItem(1)).resolves.toBeUndefined()
    expect(apiPost).toHaveBeenCalledWith({ action: 'deleteChecklistItem', id: 1 })
  })

  it('getChecklistItems should return parsed items', async () => {
    ; (apiGet as Mock).mockResolvedValue({ success: true, data: [mockItem] })
    const result = await getChecklistItems()
    expect(parseChecklistItems).toHaveBeenCalledWith([mockItem])
    expect(result).toEqual([mockItem])
  })

  it('toggleChecklistItemPacked should return updated item', async () => {
    const updatedItem = { ...mockItem, isPacked: true }
      ; (apiPost as Mock).mockResolvedValue({ success: true, data: updatedItem })
    const result = await toggleChecklistItemPacked(1, true)
    expect(result).toEqual(updatedItem)
    expect(apiPost).toHaveBeenCalledWith({ action: 'toggleChecklistItemPacked', data: { id: 1, isPacked: true } })
  })
})

describe('Checklist API - Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createChecklistItem should throw default error on failure', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false })
    const payload: CreateChecklistItemPayload = {
      category: 'documents',
      description: 'Passaporte',
      isPacked: false
    }
    await expect(createChecklistItem(payload)).rejects.toThrow('Failed to create checklist item')
  })

  it('updateChecklistItem should throw default error on failure', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false })
    const payload: UpdateChecklistItemPayload = { ...mockItem }
    await expect(updateChecklistItem(payload)).rejects.toThrow('Failed to update checklist item')
  })

  it('updateChecklistItem should throw default error if success true but no data', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true })
    const payload: UpdateChecklistItemPayload = { ...mockItem }
    await expect(updateChecklistItem(payload)).rejects.toThrow('Failed to update checklist item')
  })

  it('deleteChecklistItem should throw default error on failure', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false })
    await expect(deleteChecklistItem(1)).rejects.toThrow('Failed to delete checklist item')
  })

  it('getChecklistItems should return empty array if API fails', async () => {
    ; (apiGet as Mock).mockResolvedValue({ success: false })
    const result = await getChecklistItems()
    expect(result).toEqual([])
  })

  it('toggleChecklistItemPacked should throw default error on failure', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: false })
    await expect(toggleChecklistItemPacked(1, true)).rejects.toThrow('Failed to toggle checklist item')
  })

  it('toggleChecklistItemPacked should throw default error if success true but no data', async () => {
    ; (apiPost as Mock).mockResolvedValue({ success: true })
    await expect(toggleChecklistItemPacked(1, true)).rejects.toThrow('Failed to toggle checklist item')
  })
})