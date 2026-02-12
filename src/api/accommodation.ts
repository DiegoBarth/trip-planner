import { apiGet } from './client'
import type { Accommodation } from '@/types/Accommodation'

interface ApiResponse<T> {
   success: boolean
   data?: T
   message?: string
}

/**
 * Get all accommodations
 */
export async function getAccommodations(): Promise<Accommodation[]> {
   const response = await apiGet<ApiResponse<Accommodation[]>>({
      action: 'getAccommodations'
   })

   if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch accommodations')
   }

   return response.data
}