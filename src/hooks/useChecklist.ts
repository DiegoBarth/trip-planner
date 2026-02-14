import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
   createChecklistItem,
   updateChecklistItem,
   deleteChecklistItem,
   getChecklistItems,
   toggleChecklistItemPacked,
} from '@/api/checklist'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type {
   CreateChecklistItemPayload,
   UpdateChecklistItemPayload,
} from '@/api/checklist'
import {
   updateChecklistCacheOnCreate,
   updateChecklistCacheOnUpdate,
   updateChecklistCacheOnDelete,
   updateChecklistCacheOnToggle,
} from '@/services/checklistCacheService'

const CHECKLIST_QUERY_KEY = ['checklist']

/**
 * Hook to manage checklist operations
 */
export function useChecklist() {
   const queryClient = useQueryClient()

   // Fetch checklist items
   const { data: items = [], isLoading, error } = useQuery({
      queryKey: CHECKLIST_QUERY_KEY,
      queryFn: getChecklistItems,
      staleTime: QUERY_STALE_TIME_MS,
   })

   // Create checklist item
   const createMutation = useMutation({
      mutationFn: (payload: CreateChecklistItemPayload) =>
         createChecklistItem(payload),
      onSuccess: newItem => {
         updateChecklistCacheOnCreate(queryClient, newItem)
      },
   })

   // Update checklist item
   const updateMutation = useMutation({
      mutationFn: (payload: UpdateChecklistItemPayload) =>
         updateChecklistItem(payload),
      onSuccess: updatedItem => {
         updateChecklistCacheOnUpdate(queryClient, updatedItem)
      },
   })

   // Delete checklist item
   const deleteMutation = useMutation({
      mutationFn: (id: number) => deleteChecklistItem(id),
      onSuccess: (_, deletedId) => {
         updateChecklistCacheOnDelete(queryClient, deletedId)
      },
   })

   // Toggle packed status
   const toggleMutation = useMutation({
      mutationFn: ({ id, isPacked }: { id: number; isPacked: boolean }) =>
         toggleChecklistItemPacked(id, isPacked),
      onSuccess: toggledItem => {
         updateChecklistCacheOnToggle(queryClient, toggledItem)
      },
   })

   return {
      items,
      isLoading,
      error,
      createItem: createMutation.mutateAsync,
      updateItem: updateMutation.mutateAsync,
      deleteItem: deleteMutation.mutateAsync,
      togglePacked: toggleMutation.mutateAsync,
      isCreating: createMutation.isPending,
      isUpdating: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
      isToggling: toggleMutation.isPending,
   }
}
