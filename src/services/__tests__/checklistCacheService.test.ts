import { describe, it, expect } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import {
  updateChecklistCacheOnCreate,
  updateChecklistCacheOnUpdate,
  updateChecklistCacheOnDelete,
  updateChecklistCacheOnToggle,
} from '../checklistCacheService'
import type { ChecklistItem } from '@/types/ChecklistItem'

function makeItem(overrides: Partial<ChecklistItem> = {}): ChecklistItem {
  return {
    id: 1,
    category: 'documents',
    description: 'Passport',
    isPacked: false,
    quantity: 1,
    notes: '',
    ...overrides,
  }
}

describe('checklistCacheService', () => {
  it('updateChecklistCacheOnCreate appends new item', () => {
    const client = new QueryClient()
    client.setQueryData(['checklist'], [makeItem({ id: 1 })])
    updateChecklistCacheOnCreate(client, makeItem({ id: 2, description: 'Visa' }))
    const data = client.getQueryData<ChecklistItem[]>(['checklist'])
    expect(data).toHaveLength(2)
    expect(data?.map(i => i.id)).toEqual([1, 2])
  })

  it('updateChecklistCacheOnCreate sets single item when cache was empty', () => {
    const client = new QueryClient()
    updateChecklistCacheOnCreate(client, makeItem({ id: 1 }))
    expect(client.getQueryData(['checklist'])).toEqual([makeItem({ id: 1 })])
  })

  it('updateChecklistCacheOnUpdate replaces matching item', () => {
    const client = new QueryClient()
    const prev = makeItem({ id: 1, description: 'Old' })
    client.setQueryData(['checklist'], [prev])
    updateChecklistCacheOnUpdate(client, makeItem({ id: 1, description: 'Updated' }))
    const data = client.getQueryData<ChecklistItem[]>(['checklist'])
    expect(data?.[0].description).toBe('Updated')
  })

  it('updateChecklistCacheOnDelete removes item and decrements higher ids', () => {
    const client = new QueryClient()
    client.setQueryData(['checklist'], [
      makeItem({ id: 1 }),
      makeItem({ id: 2 }),
      makeItem({ id: 3, description: 'Third' }),
    ])
    updateChecklistCacheOnDelete(client, 2)
    const data = client.getQueryData<ChecklistItem[]>(['checklist'])
    expect(data).toHaveLength(2)
    expect(data?.map(i => i.id).sort()).toEqual([1, 2])
    expect(data?.find(i => i.description === 'Third')?.id).toBe(2)
  })

  it('updateChecklistCacheOnToggle updates isPacked for matching item', () => {
    const client = new QueryClient()
    client.setQueryData(['checklist'], [makeItem({ id: 1, isPacked: false })])
    updateChecklistCacheOnToggle(client, makeItem({ id: 1, isPacked: true }))
    const data = client.getQueryData<ChecklistItem[]>(['checklist'])
    expect(data?.[0].isPacked).toBe(true)
  })
})
