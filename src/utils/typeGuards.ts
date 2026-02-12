import type { Attraction } from '@/types/Attraction'

export function isMappableAttraction(
   a: Attraction
): a is Attraction & { lat: number; lng: number } {
   return typeof a.lat === 'number' && typeof a.lng === 'number'
}