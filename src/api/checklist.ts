import { apiGet, apiPost } from '@/api/client'
import type { ChecklistItem } from '@/types/ChecklistItem'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface CreateChecklistItemPayload {
  category: ChecklistItem['category']
  description: string
  isPacked: boolean
  quantity?: number
  notes?: string
}

export interface UpdateChecklistItemPayload extends CreateChecklistItemPayload {
  id: number
}

/**
 * Create a new checklist item
 */
export async function createChecklistItem(payload: CreateChecklistItemPayload): Promise<ChecklistItem> {
  const response = await apiPost<ApiResponse<ChecklistItem>>({
    action: 'createChecklistItem',
    data: payload
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to create checklist item');
  }

  return response.data;
}

/**
 * Update an existing checklist item
 */
export async function updateChecklistItem(payload: UpdateChecklistItemPayload): Promise<ChecklistItem> {
  const response = await apiPost<ApiResponse<ChecklistItem>>({
    action: 'updateChecklistItem',
    data: payload
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to update checklist item');
  }

  return response.data;
}

/**
 * Delete a checklist item by ID
 */
export async function deleteChecklistItem(id: number): Promise<void> {
  const response = await apiPost<ApiResponse<null>>({
    action: 'deleteChecklistItem',
    id
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to delete checklist item');
  }
}

/**
 * Get all checklist items
 */
export async function getChecklistItems(): Promise<ChecklistItem[]> {
  const response = await apiGet<ApiResponse<ChecklistItem[]>>({
    action: 'getChecklistItems'
  });

  if (!response.success || !response.data) {
    return [];
  }

  return response.data;
}

/**
 * Toggle packed status of a checklist item
 */
export async function toggleChecklistItemPacked(id: number, isPacked: boolean): Promise<ChecklistItem> {
  const response = await apiPost<ApiResponse<ChecklistItem>>({
    action: 'toggleChecklistItemPacked',
    data: {
      id,
      isPacked
    }
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to toggle checklist item');
  }

  return response.data;
}