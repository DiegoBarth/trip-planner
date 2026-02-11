import { apiGet } from './client'
import type { CurrencyRates } from '@/types/Currency'

interface ApiResponse<T> {
   success: boolean
   data?: T
   message?: string
}

/**
 * Get exchange rates from backend (Apps Script)
 */
export async function getExchangeRates(): Promise<CurrencyRates> {
   const response = await apiGet<ApiResponse<CurrencyRates>>({
      action: 'getExchangeRates'
   })

   if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch exchange rates')
   }

   return response.data
}