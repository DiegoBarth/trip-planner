import { apiGet, apiPost } from '@/api/client'
import { normalizeTimeFromSheets } from '@/utils/formatters'
import type { Reservation } from '@/types/Reservation'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

interface UploadFileResponse {
  success: boolean
  fileUrl?: string
  fileName?: string
  fileId?: string
  message?: string
}

export interface CreateReservationPayload {
  type: Reservation['type']
  title: string
  description?: string
  confirmationCode?: string
  date?: string
  endDate?: string
  time?: string
  location?: string
  provider?: string
  bookingUrl?: string
  documentUrl?: string
  documentFileId?: string
  status: Reservation['status']
  notes?: string
  country?: Reservation['country']
}

export interface UpdateReservationPayload extends CreateReservationPayload {
  id: number
}

/**
 * Create a new reservation
 */
export async function createReservation(payload: CreateReservationPayload): Promise<Reservation> {
  const response = await apiPost<ApiResponse<Reservation>>({
    action: 'createReservation',
    data: payload
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to create reservation');
  }

  return response.data;
}

/**
 * Update an existing reservation
 */
export async function updateReservation(payload: UpdateReservationPayload): Promise<Reservation> {
  const response = await apiPost<ApiResponse<Reservation>>({
    action: 'updateReservation',
    data: payload
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to update reservation');
  }

  return response.data;
}

/**
 * Delete a reservation by ID
 */
export async function deleteReservation(id: number): Promise<void> {
  const response = await apiPost<ApiResponse<null>>({
    action: 'deleteReservation',
    id
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to delete reservation');
  }
}

/**
 * Get all reservations.
 * Normalizes time field: Sheets stores "10:00" but API may return ISO datetime (e.g. 1899-12-30T13:06:28.000Z).
 */
export async function getReservations(): Promise<Reservation[]> {
  const response = await apiGet<ApiResponse<Reservation[]>>({
    action: 'getReservations'
  });

  if (!response.success || !response.data) {
    return [];
  }

  return response.data.map((r: Reservation) => ({
    ...r,
    time: normalizeTimeFromSheets(r.time) ?? r.time
  }));
}

/**
 * Upload file to Google Drive
 */
export async function uploadFile(fileName: string, fileData: string, mimeType: string): Promise<UploadFileResponse> {
  const response = await apiPost<UploadFileResponse>({
    action: 'uploadFile',
    data: {
      fileName,
      fileData,
      mimeType
    }
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to upload file');
  }

  return response;
}

/**
 * Delete file from Google Drive
 */
export async function deleteFile(fileId: string): Promise<void> {
  const response = await apiPost<ApiResponse<null>>({
    action: 'deleteFile',
    fileId
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to delete file');
  }
}