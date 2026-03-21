import { apiGet, apiPost } from '@/api/client'
import { parseChecklistItems, parseChecklistItem } from '@/api/schemas'
import type { ChecklistItem } from '@/types/ChecklistItem'

function asRecord(data: unknown): Record<string, unknown> | null {
  return typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : null
}

/**
 * Apps Script often returns only `{ id }` or partial fields on create/update.
 * Merge API response with the payload we sent so the cache always gets a full ChecklistItem.
 */
function mergeCreateResponse(payload: CreateChecklistItemPayload, raw: unknown): ChecklistItem {
  const r = asRecord(raw)
  const idRaw = r?.id
  const id = typeof idRaw === 'number' ? idRaw : typeof idRaw === 'string' ? Number(idRaw) : NaN
  if (!Number.isFinite(id)) {
    throw new Error('Resposta da API sem id válido (checklist).')
  }
  const merged = {
    id,
    description: typeof r?.description === 'string' ? r.description : payload.description,
    category: (typeof r?.category === 'string' ? r.category : payload.category) as ChecklistItem['category'],
    isPacked: typeof r?.isPacked === 'boolean' ? r.isPacked : payload.isPacked,
    quantity: typeof r?.quantity === 'number' ? r.quantity : payload.quantity,
    notes: typeof r?.notes === 'string' ? r.notes : payload.notes,
  }
  return parseChecklistItem(merged)
}

function mergeUpdateResponse(payload: UpdateChecklistItemPayload, raw: unknown): ChecklistItem {
  const r = asRecord(raw)
  const id = typeof r?.id === 'number' ? r.id : payload.id
  const merged = {
    id,
    description: typeof r?.description === 'string' ? r.description : payload.description,
    category: (typeof r?.category === 'string' ? r.category : payload.category) as ChecklistItem['category'],
    isPacked: typeof r?.isPacked === 'boolean' ? r.isPacked : payload.isPacked,
    quantity: typeof r?.quantity === 'number' ? r.quantity : payload.quantity,
    notes: typeof r?.notes === 'string' ? r.notes : payload.notes,
  }
  return parseChecklistItem(merged)
}

function mergeToggleResponse(raw: unknown, fallback: ChecklistItem): ChecklistItem {
  const r = asRecord(raw)
  const id = typeof r?.id === 'number' ? r.id : fallback.id
  const isPacked = typeof r?.isPacked === 'boolean' ? r.isPacked : fallback.isPacked
  const merged = {
    ...fallback,
    id,
    isPacked,
    description: typeof r?.description === 'string' ? r.description : fallback.description,
    category: (typeof r?.category === 'string' ? r.category : fallback.category) as ChecklistItem['category'],
    quantity: typeof r?.quantity === 'number' ? r.quantity : fallback.quantity,
    notes: typeof r?.notes === 'string' ? r.notes : fallback.notes,
  }
  return parseChecklistItem(merged)
}

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

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Failed to create checklist item');
  }

  return mergeCreateResponse(payload, response.data);
}

/**
 * Update an existing checklist item
 */
export async function updateChecklistItem(payload: UpdateChecklistItemPayload): Promise<ChecklistItem> {
  const response = await apiPost<ApiResponse<ChecklistItem>>({
    action: 'updateChecklistItem',
    data: payload
  });

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Failed to update checklist item');
  }

  return mergeUpdateResponse(payload, response.data);
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

  return parseChecklistItems(response.data) as ChecklistItem[];
}

/**
 * Toggle packed status of a checklist item
 * @param fallbackItem - current row from cache when API returns only partial fields
 */
export async function toggleChecklistItemPacked(
  id: number,
  isPacked: boolean,
  fallbackItem?: ChecklistItem
): Promise<ChecklistItem> {
  const response = await apiPost<ApiResponse<ChecklistItem>>({
    action: 'toggleChecklistItemPacked',
    data: {
      id,
      isPacked
    }
  });

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Failed to toggle checklist item');
  }

  if (fallbackItem) {
    return mergeToggleResponse(response.data, fallbackItem);
  }

  try {
    return parseChecklistItem(response.data);
  }
  catch {
    throw new Error(response.message || 'Resposta inválida ao alternar item do checklist');
  }
}