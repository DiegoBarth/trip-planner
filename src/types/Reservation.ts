export type ReservationType = 
  | 'document'        // Passport, visa, etc.
  | 'insurance'       // Travel insurance
  | 'flight'          // Flight tickets
  | 'train'           // Train tickets
  | 'bus'             // Bus tickets
  | 'accommodation'   // Hotels, Airbnb
  | 'transport-pass'  // JR Pass, T-Money, Suica
  | 'activity'        // Pre-purchased tickets for attractions
  | 'other'

export type BookingStatus = 
  | 'pending'         // Awaiting confirmation
  | 'confirmed'       // Confirmed and ready
  | 'cancelled'       // Cancelled
  | 'completed'       // Already used/past

export interface Reservation {
  id: number
  type: ReservationType
  title: string
  description?: string
  confirmationCode?: string
  date?: string        // Check-in date, flight date, or expiry date
  endDate?: string     // Check-out date or return flight date
  time?: string        // Flight time, check-in time
  location?: string    // Airport, hotel address, etc.
  provider?: string    // Airline, hotel name, insurance company
  bookingUrl?: string  // Link to booking confirmation
  documentUrl?: string // Link to PDF/document or Drive file
  documentFileId?: string // Google Drive file ID for deletion
  status: BookingStatus
  notes?: string
  country?: 'japan' | 'south-korea' | 'general'
  attractionId?: number // Optional link to an attraction
}
