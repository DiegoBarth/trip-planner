import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAttraction, updateAttraction, deleteAttraction, getAttractions } from '@/api/attraction'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type { CreateAttractionPayload, UpdateAttractionPayload } from '@/api/attraction'
import { dateToInputFormat } from '@/utils/formatters'

const ATTRACTION_QUERY_KEY = ['attractions']

/**
 * Hook to manage attraction operations
 */
export function useAttraction() {
   const queryClient = useQueryClient()

   // Fetch all attractions
   const { data: attractions = [], isLoading, error } = useQuery({
      queryKey: ATTRACTION_QUERY_KEY,
      queryFn: getAttractions,
      staleTime: QUERY_STALE_TIME_MS,
   })

   // Create attraction mutation
   const createMutation = useMutation({
      mutationFn: (payload: CreateAttractionPayload) => createAttraction(payload),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ATTRACTION_QUERY_KEY })
      },
   })

   // Update attraction mutation
   const updateMutation = useMutation({
      mutationFn: (payload: UpdateAttractionPayload) => updateAttraction(payload),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ATTRACTION_QUERY_KEY })
      },
   })

   // Delete attraction mutation
   const deleteMutation = useMutation({
      mutationFn: (id: number) => deleteAttraction(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ATTRACTION_QUERY_KEY })
      },
   })

   const toggleVisited = async (id: number) => {
      const attraction = attractions.find(a => a.id === id)
      if (!attraction) return

      attraction.date = dateToInputFormat(attraction.date)

      await updateMutation.mutateAsync({
         ...attraction,
         visited: !attraction.visited
      })
   }

   return {
      attractions,
      isLoading,
      error,
      createAttraction: createMutation.mutateAsync,
      updateAttraction: updateMutation.mutateAsync,
      deleteAttraction: deleteMutation.mutateAsync,
      toggleVisited,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
   }
}
