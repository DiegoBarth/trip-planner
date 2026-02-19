import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
   createReservation,
   updateReservation,
   deleteReservation,
   getReservations,
   deleteFile,
} from '@/api/reservation'
import { deleteAttraction, updateAttraction } from '@/api/attraction'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type {
   CreateReservationPayload,
   UpdateReservationPayload,
} from '@/api/reservation'
import type { Reservation } from '@/types/Reservation'
import type { Attraction } from '@/types/Attraction'
import { dateToInputFormat } from '@/utils/formatters'
import {
   updateReservationCacheOnCreate,
   updateReservationCacheOnUpdate,
   updateReservationCacheOnDelete,
} from '@/services/reservationCacheService'
import { updateAttractionCacheOnDelete } from '@/services/attractionCacheService'

const RESERVATION_QUERY_KEY = ['reservations']

/**
 * Hook to manage reservation operations
 */
export function useReservation() {
   const queryClient = useQueryClient()

   // Fetch reservations
   const { data: reservations = [], isLoading, error } = useQuery({
      queryKey: RESERVATION_QUERY_KEY,
      queryFn: getReservations,
      staleTime: QUERY_STALE_TIME_MS,
   })

   // Create reservation
   const createMutation = useMutation({
      mutationFn: (payload: CreateReservationPayload) =>
         createReservation(payload),
      onSuccess: newReservation => {
         updateReservationCacheOnCreate(queryClient, newReservation)
      },
   })

   // Update reservation
   const updateMutation = useMutation({
      mutationFn: async (payload: UpdateReservationPayload) => {
         // Get the old reservation to check if it had a document file
         const oldReservation = reservations.find((r: Reservation) => r.id === payload.id)
         
         // If the old reservation had a file and the new payload has a different fileId (or no fileId),
         // delete the old file from Drive
         if (oldReservation?.documentFileId && 
             oldReservation.documentFileId !== payload.documentFileId) {
            try {
               await deleteFile(oldReservation.documentFileId)
            } catch (error) {
               console.error('Error deleting old file from Drive:', error)
               // Continue with update even if file deletion fails
            }
         }
         payload.date = payload.date ? dateToInputFormat(payload.date) : undefined;
         payload.endDate = payload.endDate ? dateToInputFormat(payload.endDate) : undefined;
         
         // Update the reservation
         const updatedReservation = await updateReservation(payload)
         
         // If reservation is linked to an attraction, sync the reservation status
         if (updatedReservation.attractionId && updatedReservation.status) {
            try {
               // Get all attractions from all countries
               const attractionCountries: ('japan' | 'south-korea' | 'general')[] = ['japan', 'south-korea', 'general']
               let linkedAttraction: Attraction | null = null
               let attractionCountry: 'japan' | 'south-korea' | 'general' | null = null
               
               // Find the linked attraction across all countries
               for (const country of attractionCountries) {
                  const attractions = queryClient.getQueryData<Attraction[]>(['attractions', country])
                  if (attractions) {
                     const found = attractions.find(a => a.id === updatedReservation.attractionId)
                     if (found) {
                        linkedAttraction = found
                        attractionCountry = country
                        break
                     }
                  }
               }
               
               if (linkedAttraction && attractionCountry) {
                  // Map reservation status to attraction reservation status
                  let attractionStatus: 'pending' | 'confirmed' | 'cancelled' | undefined
                  if (updatedReservation.status === 'confirmed') attractionStatus = 'confirmed'
                  else if (updatedReservation.status === 'pending') attractionStatus = 'pending'
                  else if (updatedReservation.status === 'cancelled') attractionStatus = 'cancelled'
                  
                  if (attractionStatus) {
                     await updateAttraction({
                        ...linkedAttraction,
                        date: dateToInputFormat(linkedAttraction.date),
                        reservationStatus: attractionStatus
                     })
                     
                     // Update attraction cache
                     queryClient.setQueryData<Attraction[]>(
                        ['attractions', attractionCountry],
                        (old = []) => old.map(a => 
                           a.id === linkedAttraction!.id 
                              ? { ...a, reservationStatus: attractionStatus }
                              : a
                        )
                     )
                  }
               }
            } catch (error) {
               console.error('Error syncing status with linked attraction:', error)
               // Continue anyway - don't block reservation update
            }
         }
         
         return updatedReservation
      },
      onSuccess: updatedReservation => {
         updateReservationCacheOnUpdate(queryClient, updatedReservation)
      },
   })

   // Delete reservation
   const deleteMutation = useMutation({
      mutationFn: async (id: number) => {
         // Get the reservation to check if it has a document file and linked attraction
         const reservation = reservations.find((r: Reservation) => r.id === id)
         
         // If the reservation has a document file, delete it from Drive first
         if (reservation?.documentFileId) {
            try {
               await deleteFile(reservation.documentFileId)
            } catch (error) {
               console.error('Error deleting file from Drive:', error)
               // Continue with reservation deletion even if file deletion fails
            }
         }
         
         // If linked to an attraction, delete the attraction too (cascade delete)
         if (reservation?.attractionId) {
            try {
               await deleteAttraction(reservation.attractionId)
               
               // Update attraction cache - find which country and update
               const attractionCountries: ('japan' | 'south-korea' | 'general')[] = ['japan', 'south-korea', 'general']
               for (const country of attractionCountries) {
                  const attractions = queryClient.getQueryData<Attraction[]>(['attractions', country])
                  if (attractions?.some(a => a.id === reservation.attractionId)) {
                     updateAttractionCacheOnDelete(queryClient, reservation.attractionId)
                     break
                  }
               }
            } catch (error) {
               console.error('Error cascade deleting linked attraction:', error)
               // Continue with reservation deletion even if attraction deletion fails
            }
         }
         
         // Delete the reservation
         return deleteReservation(id)
      },
      onSuccess: (_, deletedId) => {
         updateReservationCacheOnDelete(queryClient, deletedId)
      },
   })

   return {
      reservations,
      isLoading,
      error,
      createReservation: createMutation.mutateAsync,
      updateReservation: updateMutation.mutateAsync,
      deleteReservation: deleteMutation.mutateAsync,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
   }
}
