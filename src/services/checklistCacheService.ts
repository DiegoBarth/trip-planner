import type { QueryClient } from '@tanstack/react-query'
import type { ChecklistItem } from '@/types/ChecklistItem'

const CHECKLIST_QUERY_KEY = ['checklist'];

/**
 * Update checklist cache after creating a new item
 */
export function updateChecklistCacheOnCreate(queryClient: QueryClient, newItem: ChecklistItem) {
  queryClient.setQueryData<ChecklistItem[]>(CHECKLIST_QUERY_KEY, (old = []) => {
    return [...old, newItem];
  });
}

/**
 * Update checklist cache after updating an item
 */
export function updateChecklistCacheOnUpdate(queryClient: QueryClient, updatedItem: ChecklistItem) {
  queryClient.setQueryData<ChecklistItem[]>(CHECKLIST_QUERY_KEY, (old = []) => {
    return old.map(item => item.id === updatedItem.id ? updatedItem : item);
  });
}

/**
 * Update checklist cache after deleting an item
 */
export function updateChecklistCacheOnDelete(queryClient: QueryClient, deletedId: number) {
  queryClient.setQueryData<ChecklistItem[]>(CHECKLIST_QUERY_KEY, (old = []) => {
    return old.filter(item => item.id !== deletedId)
      .map(item => {
        if (item.id > deletedId) {
          return { ...item, id: item.id - 1 };
        }

        return item;
      })
  });
}

/**
 * Update checklist cache after toggling packed status
 */
export function updateChecklistCacheOnToggle(queryClient: QueryClient, toggledItem: ChecklistItem) {
  queryClient.setQueryData<ChecklistItem[]>(CHECKLIST_QUERY_KEY, (old = []) => {
    return old.map(item =>
      item.id === toggledItem.id
        ? { ...item, isPacked: toggledItem.isPacked }
        : item
    );
  });
}