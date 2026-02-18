import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAttraction, updateAttraction, deleteAttraction, getAttractions, bulkUpdateAttractions } from '@/api/attraction'
import { deleteReservation, updateReservation } from '@/api/reservation'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type { CreateAttractionPayload, UpdateAttractionPayload } from '@/api/attraction'
import { dateToInputFormat } from '@/utils/formatters'
import type { Attraction } from '@/types/Attraction'
import type { CountryFilterValue } from '@/types/Attraction'
import type { Reservation } from '@/types/Reservation'
import { applyAutoDays, normalizeOrderByDate } from '@/utils/attractionDayUtils'
import {
   updateAttractionCacheOnCreate,
   updateAttractionCacheOnUpdate,
   updateAttractionCacheOnDelete
} from '@/services/attractionCacheService'
import { updateReservationCacheOnDelete } from '@/services/reservationCacheService'

const ATTRACTION_QUERY_KEY = ['attractions']

/**
 * Hook to manage attraction operations. Fetches all attractions; filters by country on the client.
 * 'todos' = todos os registros; 'all' = geral; 'japan' | 'south-korea' = país.
 */
export function useAttraction(country: CountryFilterValue) {
   const queryClient = useQueryClient()

   const { data: allAttractions = [], isLoading, error } = useQuery<Attraction[]>({
      queryKey: ATTRACTION_QUERY_KEY,
      queryFn: getAttractions,
      staleTime: QUERY_STALE_TIME_MS,
   })

   const rawFiltered =
      country === 'todos'
         ? allAttractions
         : allAttractions.filter(a => (a.country ?? 'all') === country)

   const attractions = useMemo(
      () => normalizeOrderByDate(applyAutoDays(rawFiltered)),
      [rawFiltered]
   )

   const createMutation = useMutation({
      mutationFn: (payload: CreateAttractionPayload) => createAttraction(payload),
      onSuccess: newAttraction => {
         updateAttractionCacheOnCreate(queryClient, newAttraction)
         queryClient.invalidateQueries({ queryKey: ['osrm-routes'] })
      }
   })

   // Update mutation
   const updateMutation = useMutation({
      mutationFn: async (payload: UpdateAttractionPayload) => {
         const updatedAttraction = await updateAttraction(payload)
         
         // If attraction is linked to a reservation, sync the reservation status
         if (updatedAttraction.reservationId && updatedAttraction.reservationStatus) {
            try {
               const reservations = queryClient.getQueryData<Reservation[]>(['reservations'])
               const linkedReservation = reservations?.find(r => r.id === updatedAttraction.reservationId)
               
               if (linkedReservation) {
                  // Map attraction status to reservation status
                  let reservationStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' | undefined
                  if (updatedAttraction.reservationStatus === 'confirmed') reservationStatus = 'confirmed'
                  else if (updatedAttraction.reservationStatus === 'pending') reservationStatus = 'pending'
                  else if (updatedAttraction.reservationStatus === 'cancelled') reservationStatus = 'cancelled'
                  
                  if (reservationStatus) {
                     linkedReservation.date = dateToInputFormat(updatedAttraction.date);
                     linkedReservation.endDate = dateToInputFormat(updatedAttraction.date);
                     linkedReservation.attractionId = updatedAttraction.id;

                     await updateReservation({
                        ...linkedReservation,
                        status: reservationStatus
                     })
                     
                     // Update reservation cache
                     queryClient.setQueryData<Reservation[]>(
                        ['reservations'],
                        (old = []) => old.map(r => 
                           r.id === linkedReservation.id 
                              ? { ...r, status: reservationStatus }
                              : r
                        )
                     )
                  }
               }
            } catch (error) {
               console.error('Error syncing status with linked reservation:', error)
            }
         }
         
         return updatedAttraction
      },
      onSuccess: updatedAttraction => {
         const previousAttractions = queryClient.getQueryData<Attraction[]>(ATTRACTION_QUERY_KEY)
         const previous = previousAttractions?.find(a => a.id === updatedAttraction.id)
         if (!previous) return
         updateAttractionCacheOnUpdate(queryClient, previous, updatedAttraction)
         queryClient.invalidateQueries({ queryKey: ['osrm-routes'] })
      }
   })

   // Delete mutation
   const deleteMutation = useMutation({
      mutationFn: async (id: number) => {
         // Get the attraction to check if it's linked to a reservation
         const attraction = attractions.find(a => a.id === id)
         
         // If linked to a reservation, delete the reservation too (cascade delete)
         if (attraction?.reservationId) {
            try {
               await deleteReservation(attraction.reservationId)
               
               // Update reservation cache
               updateReservationCacheOnDelete(queryClient, attraction.reservationId)
            } catch (error) {
               console.error('Error cascade deleting linked reservation:', error)
               // Continue with attraction deletion even if reservation deletion fails
            }
         }
         
         // Delete the attraction
         return deleteAttraction(id)
      },
      onSuccess: (_, deletedId) => {
         updateAttractionCacheOnDelete(queryClient, deletedId)
         queryClient.invalidateQueries({ queryKey: ['osrm-routes'] })
      }
   })

   const getFreshAttractions = (): Attraction[] => {
      const cachedData = queryClient.getQueryData<Attraction[]>(ATTRACTION_QUERY_KEY)
      const rawData = cachedData ?? allAttractions
      return normalizeOrderByDate(applyAutoDays(rawData))
   }

   const toggleVisited = async (id: number) => {
      const freshAttractions = getFreshAttractions()
      const attraction = freshAttractions.find(a => a.id === id)
      if (!attraction) return

      await updateMutation.mutateAsync({
         ...attraction,
         date: dateToInputFormat(attraction.date),
         visited: !attraction.visited
      })
   }

   const bulkUpdate = async (attractionsToUpdate: Attraction[]) => {
      if (attractionsToUpdate.length === 0) return

      const payload: UpdateAttractionPayload[] = attractionsToUpdate.map(attr => ({
         ...attr,
         date: dateToInputFormat(attr.date)
      }))

      const updated = await bulkUpdateAttractions(payload)
      queryClient.setQueryData<Attraction[]>(ATTRACTION_QUERY_KEY, (old = []) => {
         const updatedMap = new Map(updated.map(a => [a.id, a]))
         return old.map(a => updatedMap.get(a.id) ?? a)
      })

      return updated
   }

   return {
      attractions,
      isLoading,
      error,
      createAttraction: createMutation.mutateAsync,
      updateAttraction: updateMutation.mutateAsync,
      deleteAttraction: deleteMutation.mutateAsync,
      toggleVisited,
      bulkUpdate,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending
   }
}