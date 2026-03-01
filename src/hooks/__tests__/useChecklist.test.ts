import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useChecklist } from '../useChecklist'
import { createQueryClientWrapper } from './wrapper'

const mockGetChecklistItems = vi.fn()
const mockCreateChecklistItem = vi.fn()
const mockUpdateChecklistItem = vi.fn()
const mockDeleteChecklistItem = vi.fn()
const mockToggleChecklistItemPacked = vi.fn()

vi.mock('@/api/checklist', () => ({
  getChecklistItems: (...args: unknown[]) => mockGetChecklistItems(...args),
  createChecklistItem: (...args: unknown[]) => mockCreateChecklistItem(...args),
  updateChecklistItem: (...args: unknown[]) => mockUpdateChecklistItem(...args),
  deleteChecklistItem: (...args: unknown[]) => mockDeleteChecklistItem(...args),
  toggleChecklistItemPacked: (...args: unknown[]) => mockToggleChecklistItemPacked(...args),
}))

function makeItem(overrides: Partial<{ id: number; isPacked: boolean; description: string }> = {}) {
  return {
    id: 1,
    category: 'documents' as const,
    description: 'Passport',
    isPacked: false,
    quantity: 1,
    notes: '',
    ...overrides,
  }
}

describe('useChecklist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetChecklistItems.mockResolvedValue([])
  })

  it('returns items and loading state', async () => {
    const items = [makeItem({ id: 1 }), makeItem({ id: 2 })]
    mockGetChecklistItems.mockResolvedValue(items)

    const Wrapper = createQueryClientWrapper()

    const { result } = renderHook(() => useChecklist(), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2)
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.createItem).toBeDefined()
    expect(result.current.updateItem).toBeDefined()
    expect(result.current.deleteItem).toBeDefined()
    expect(result.current.togglePacked).toBeDefined()
  })

  it('createItem calls API', async () => {
    const newItem = makeItem({ id: 99 })
    mockCreateChecklistItem.mockResolvedValue(newItem)

    const Wrapper = createQueryClientWrapper([
      { queryKey: ['checklist'], data: [] },
    ])

    const { result } = renderHook(() => useChecklist(), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.items).toEqual([]))

    await result.current.createItem({
      category: 'documents',
      description: 'Passport',
      isPacked: false,
    })

    expect(mockCreateChecklistItem).toHaveBeenCalledTimes(1)
  })

  it('togglePacked calls API', async () => {
    mockToggleChecklistItemPacked.mockResolvedValue(makeItem({ id: 1, isPacked: true }))
    const items = [makeItem({ id: 1, isPacked: false })]
    const Wrapper = createQueryClientWrapper([
      { queryKey: ['checklist'], data: items },
    ])

    const { result } = renderHook(() => useChecklist(), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.items).toHaveLength(1))
    await result.current.togglePacked({ id: 1, isPacked: true })
    expect(mockToggleChecklistItemPacked).toHaveBeenCalledWith(1, true)
  })

  it('updateItem calls API with payload', async () => {
    const item = makeItem({ id: 1, description: 'Old' })
    const updated = makeItem({ id: 1, description: 'Updated' })
    mockUpdateChecklistItem.mockResolvedValue(updated)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['checklist'], data: [item] }])
    const { result } = renderHook(() => useChecklist(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.items).toHaveLength(1))
    await result.current.updateItem({
      id: 1,
      category: 'documents',
      description: 'Updated',
      isPacked: false,
    })
    expect(mockUpdateChecklistItem).toHaveBeenCalledTimes(1)
  })

  it('deleteItem calls API', async () => {
    const item = makeItem({ id: 1 })
    mockDeleteChecklistItem.mockResolvedValue(undefined)
    const Wrapper = createQueryClientWrapper([{ queryKey: ['checklist'], data: [item] }])
    const { result } = renderHook(() => useChecklist(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.items).toHaveLength(1))
    await result.current.deleteItem(1)
    expect(mockDeleteChecklistItem).toHaveBeenCalledWith(1)
  })

  it('exposes isCreating, isUpdating, isDeleting, isToggling and error', async () => {
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useChecklist(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isCreating).toBe(false)
    expect(result.current.isUpdating).toBe(false)
    expect(result.current.isDeleting).toBe(false)
    expect(result.current.isToggling).toBe(false)
    expect(result.current).toHaveProperty('error')
  })

  it('returns empty items and loading true initially before query resolves', () => {
    mockGetChecklistItems.mockImplementation(() => new Promise(() => {}))
    const Wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useChecklist(), { wrapper: Wrapper })
    expect(result.current.items).toEqual([])
    expect(result.current.isLoading).toBe(true)
  })
})
