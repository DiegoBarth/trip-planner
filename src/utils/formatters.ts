import { CURRENCY_RATES } from "@/config/constants"
import type { Currency } from "@/types/Attraction"

export function convertToBRL(amount: number, currency: Currency): number {
   if (currency === 'BRL') return amount

   const rate = CURRENCY_RATES[`${currency}_BRL` as keyof typeof CURRENCY_RATES]
   return amount * rate
}

// Convert amount from one currency to another
export function convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
   if (fromCurrency === toCurrency) return amount
   
   // Convert to BRL first
   const amountInBRL = convertToBRL(amount, fromCurrency)
   
   // Convert from BRL to target currency
   if (toCurrency === 'BRL') return amountInBRL
   
   const rate = CURRENCY_RATES[`${toCurrency}_BRL` as keyof typeof CURRENCY_RATES]
   return amountInBRL / rate
}

// Format value while typing - BRL (with decimals)
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

// Format value while typing - JPY (no decimals)
export function formatCurrencyInputJPY(value: string): string {
   // Remove all non-digit characters
   const numbers = value.replace(/\D/g, '')
   if (!numbers) return ''

   // Convert to number (no division, JPY has no decimals)
   const amount = Number(numbers)

   // Format as Japanese Yen
   return `¥ ${amount.toLocaleString('pt-BR')}`
}

// Format value while typing - KRW (no decimals)
export function formatCurrencyInputKRW(value: string): string {
   // Remove all non-digit characters
   const numbers = value.replace(/\D/g, '')
   if (!numbers) return ''

   // Convert to number (no division, KRW has no decimals)
   const amount = Number(numbers)

   // Format as Korean Won
   return `₩ ${amount.toLocaleString('pt-BR')}`
}

// Dispatcher: Format value while typing based on currency
export function formatCurrencyInputByCurrency(value: string, currency: Currency): string {
   switch (currency) {
      case 'BRL':
         return formatCurrencyInput(value)
      case 'JPY':
         return formatCurrencyInputJPY(value)
      case 'KRW':
         return formatCurrencyInputKRW(value)
      default:
         return value
   }
}

// Convert formatted value back to number
export function currencyToNumber(value: string, currency: Currency = 'BRL'): number {
   if (!value) return 0

   // Remove currency symbols, spaces, and thousand separators (dots)
   // Keep only digits and comma (decimal separator)
   const cleanValue = value.replace(/[R$¥₩\s.]/g, '')

   // For BRL, replace comma with dot for decimal conversion
   // For JPY and KRW, there are no decimals
   const numericValue = currency === 'BRL' ? cleanValue.replace(',', '.') : cleanValue

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