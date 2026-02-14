import type { QueryClient } from '@tanstack/react-query'
import type { Reservation } from '@/types/Reservation'

const RESERVATION_QUERY_KEY = ['reservations']

/**
 * Update reservation cache after creating a new item
 */
export function updateReservationCacheOnCreate(
   queryClient: QueryClient,
   newReservation: Reservation
) {
   queryClient.setQueryData<Reservation[]>(RESERVATION_QUERY_KEY, (old = []) => {
      return [...old, newReservation]
   })
}

/**
 * Update reservation cache after updating an item
 */
export function updateReservationCacheOnUpdate(
   queryClient: QueryClient,
   updatedReservation: Reservation
) {
   queryClient.setQueryData<Reservation[]>(RESERVATION_QUERY_KEY, (old = []) => {
      return old.map(item => item.id === updatedReservation.id ? updatedReservation : item)
   })
}

/**
 * Update reservation cache after deleting an item
 * IMPORTANT: Since ID is row number, we need to reorder IDs of all items after deleted one
 */
export function updateReservationCacheOnDelete(
   queryClient: QueryClient,
   deletedId: number
) {
   queryClient.setQueryData<Reservation[]>(RESERVATION_QUERY_KEY, (old = []) => {
      // Remove deleted item and reorder IDs
      return old
         .filter(item => item.id !== deletedId)
         .map(item => {
            // If item ID is greater than deleted, decrement by 1
            // because row was removed and rows below moved up
            if (item.id > deletedId) {
               return { ...item, id: item.id - 1 }
            }
            return item
         })
   })
}
