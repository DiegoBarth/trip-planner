import { apiGet, apiPost } from './client'
import type { Attraction, Country } from '@/types/Attraction'

interface ApiResponse<T> {
   success: boolean
   data?: T
   message?: string
}

export interface CreateAttractionPayload {
   name: string
   country: Attraction['country']
   city: string
   region?: string
   day: number
   date: string
   dayOfWeek: string
   type: Attraction['type']
   order: number
   visited: boolean
   needsReservation: boolean
   reservationStatus?: string
   couplePrice: number
   currency: Attraction['currency']
   priceInBRL: number
   idealPeriod?: Attraction['idealPeriod']
   isOpen?: boolean
   openingTime?: string
   closingTime?: string
   closedDays?: string[]
   ticketLink?: string
   location?: string
   duration?: number
   notes?: string
   imageUrl?: string
}

export interface UpdateAttractionPayload extends CreateAttractionPayload {
   id: number
}

/**
 * Create a new attraction entry
 */
export async function createAttraction(payload: CreateAttractionPayload): Promise<Attraction> {
   const response = await apiPost<ApiResponse<Attraction>>({
      action: 'createAttraction',
      data: payload
   })

   if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create attraction')
   }

   return response.data
}

/**
 * Update an existing attraction entry
 */
export async function updateAttraction(payload: UpdateAttractionPayload): Promise<Attraction> {
   const response = await apiPost<ApiResponse<Attraction>>({
      action: 'updateAttraction',
      data: payload
   })

   if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update attraction')
   }

   return response.data
}

/**
 * Delete an attraction entry by ID
 */
export async function deleteAttraction(id: number): Promise<void> {
   const response = await apiPost<ApiResponse<null>>({
      action: 'deleteAttraction',
      id
   })

   if (!response.success) {
      throw new Error(response.message || 'Failed to delete attraction')
   }
}

/**
 * Get all attractions
 */
export async function getAttractions(country: Country): Promise<Attraction[]> {
   const response = await apiGet<ApiResponse<Attraction[]>>({
      action: 'getAttractions',
      country
   })

   if (!response.success || !response.data) {
      return []
   }

   return response.data
}
