import { CURRENCY_RATES } from "@/config/constants"
import type { Currency } from "@/types/Attraction"

export function convertToBRL(amount: number, currency: Currency): number {
   if (currency === 'BRL') return amount

   const rate = CURRENCY_RATES[`${currency}_BRL` as keyof typeof CURRENCY_RATES]
   return amount * rate
}

// Format value while typing
export function formatCurrencyInput(value: string): string {
   // Remove all non-digit characters
   const numbers = value.replace(/\D/g, '')
   if (!numbers) return ''

   // Convert to number and divide by 100 (cents)
   const amount = Number(numbers) / 100

   // Format as Brazilian currency
   return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      style: 'currency',
      currency: 'BRL'
   })
}

// Convert formatted value back to number
export function currencyToNumber(value: string): number {
   if (!value) return 0

   // Remove currency symbol, spaces, and thousand separators (dots)
   // Keep only digits and comma (decimal separator)
   const cleanValue = value.replace(/[R$\s.]/g, '')

   // Replace comma with dot for decimal conversion
   const numericValue = cleanValue.replace(',', '.')

   const result = Number(numericValue)

   return isNaN(result) ? 0 : result
}


export function formatCurrency(amount: number, currency: Currency = 'BRL'): string {
   const symbols: Record<Currency, string> = {
      BRL: 'R$',
      JPY: '¥',
      KRW: '₩'
   }

   return `${symbols[currency]} ${amount.toLocaleString('pt-BR', {
      minimumFractionDigits: currency === 'BRL' ? 2 : 0,
      maximumFractionDigits: currency === 'BRL' ? 2 : 0
   })}`
}
export function formatDate(date: string): string {
   if (!date) return ''

   // If already in DD/MM/YYYY format, return as is
   if (date.includes('/')) {
      return date
   }

   // If ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss), convert to DD/MM/YYYY
   const dateOnly = date.split('T')[0]
   const [year, month, day] = dateOnly.split('-')
   return `${day}/${month}/${year}`
}

export function formatWeekday(date: string): string {
   return new Date(date).toLocaleDateString('pt-BR', { weekday: 'long' })
}

// Convert date to YYYY-MM-DD format for input[type="date"]
export function dateToInputFormat(date: string): string {
   if (!date) return ''

   // Check if date is in DD/MM/YYYY format
   if (date.includes('/')) {
      const [day, month, year] = date.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
   }

   // If ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss), extract date only
   return date.split('T')[0]
}

export function formatTime(time: string): string {
   return time
}

export function formatDuration(minutes: number): string {
   const hours = Math.floor(minutes / 60)
   const mins = minutes % 60

   if (hours === 0) return `${mins}min`
   if (mins === 0) return `${hours}h`
   return `${hours}h ${mins}min`
}