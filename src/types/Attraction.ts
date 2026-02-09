export type Country = 'japan' | 'south-korea' | 'all'
export type Currency = 'JPY' | 'KRW' | 'BRL'
export type AttractionType = 
  | 'temple' 
  | 'museum' 
  | 'park' 
  | 'shopping' 
  | 'restaurant' 
  | 'viewpoint' 
  | 'cultural' 
  | 'entertainment'
  | 'other'

export type BudgetOrigin = 'Diego' | 'Pamela' | 'Casal'

export type Period = 'morning' | 'afternoon' | 'evening' | 'night' | 'full-day'

export type ReservationStatus = 'not-needed' | 'pending' | 'confirmed' | 'cancelled'

export interface Attraction {
  id: number
  name: string
  country: Country
  city: string
  region?: string
  day: number
  date: string
  dayOfWeek: string
  type: AttractionType
  order: number
  
  // Hours and Timing
  idealPeriod?: Period
  isOpen?: boolean
  openingTime?: string
  closingTime?: string
  closedDays?: string[]
  
  // Status
  visited: boolean
  needsReservation: boolean
  reservationStatus?: ReservationStatus
  
  // Values
  couplePrice: number
  currency: Currency
  priceInBRL: number
  
  // Links and Info
  ticketLink?: string
  location?: string
  duration?: number
  notes?: string
  imageUrl?: string
}

export interface AttractionFilters {
  country?: Country
  city?: string
  day?: number
  type?: AttractionType
  visited?: boolean
}
