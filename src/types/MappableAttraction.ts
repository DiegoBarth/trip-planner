import type { Attraction } from './Attraction'

export type MappableAttraction = Attraction & {
   lat: number
   lng: number
}