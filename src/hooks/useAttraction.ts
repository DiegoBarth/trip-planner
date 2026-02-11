import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAttraction, updateAttraction, deleteAttraction, getAttractions, bulkUpdateAttractions } from '@/api/attraction'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type { CreateAttractionPayload, UpdateAttractionPayload } from '@/api/attraction'
import { dateToInputFormat } from '@/utils/formatters'
import type { Attraction, Country } from '@/types/Attraction'
import { applyAutoDays, normalizeOrderByDate } from '@/utils/attractionDayUtils'
import {
   updateAttractionCacheOnCreate,
   updateAttractionCacheOnUpdate,
   updateAttractionCacheOnDelete
} from '@/services/attractionCacheService'

/**
 * Hook to manage attraction operations
 */
export function useAttraction(country: Country) {
   const ATTRACTION_QUERY_KEY = ['attractions', country]
   const queryClient = useQueryClient()

   // Fetch all attractions
   const { data, isLoading, error } = useQuery<Attraction[]>({
      queryKey: ATTRACTION_QUERY_KEY,
      queryFn: () => getAttractions(country),
      staleTime: QUERY_STALE_TIME_MS,
   })

   const rawAttractions = data ?? []
   const attractions = useMemo(
      () => normalizeOrderByDate(applyAutoDays(rawAttractions)),
      [rawAttractions]
   )

   // Create mutation
   const createMutation = useMutation({
      mutationFn: (payload: CreateAttractionPayload) => createAttraction(payload),
      onSuccess: newAttraction => {
         updateAttractionCacheOnCreate(queryClient, country, newAttraction)
      }
   })

   // Update mutation
   const updateMutation = useMutation({
      mutationFn: (payload: UpdateAttractionPayload) => updateAttraction(payload),
      onSuccess: updatedAttraction => {
         const previous = attractions.find(a => a.id === updatedAttraction.id)
         if (!previous) return
         updateAttractionCacheOnUpdate(queryClient, country, previous, updatedAttraction)
      }
   })

   // Delete mutation
   const deleteMutation = useMutation({
      mutationFn: (id: number) => deleteAttraction(id),
      onSuccess: (_, deletedId) => {
         updateAttractionCacheOnDelete(queryClient, country, deletedId)
      }
   })

   // Helper function to get fresh attractions from cache
   const getFreshAttractions = (): Attraction[] => {
      const cachedData = queryClient.getQueryData<Attraction[]>(ATTRACTION_QUERY_KEY)
      const rawData = cachedData ?? rawAttractions
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