import { CURRENCY_RATES } from "@/config/constants"
import type { Currency } from "@/types/Attraction"

export function convertToBRL(amount: number, currency: Currency): number {
   if (currency === 'BRL') return amount

   const rate = CURRENCY_RATES[`${currency}_BRL` as keyof typeof CURRENCY_RATES]
   return amount * rate
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
   return new Date(date).toLocaleDateString('pt-BR')
}

export function formatWeekday(date: string): string {
   return new Date(date).toLocaleDateString('pt-BR', { weekday: 'long' })
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