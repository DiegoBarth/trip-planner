import type { QueryClient } from '@tanstack/react-query'
import type { Attraction } from '@/types/Attraction'

const ATTRACTION_QUERY_KEY = ['attractions'];

export function updateAttractionCacheOnCreate(queryClient: QueryClient, newAttraction: Attraction) {
  queryClient.setQueryData<Attraction[]>(
    ATTRACTION_QUERY_KEY,
    old => (old ? [...old, newAttraction] : [newAttraction])
  );
}

export function updateAttractionCacheOnUpdate(queryClient: QueryClient, previousAttraction: Attraction, updatedAttraction: Attraction) {
  queryClient.setQueryData<Attraction[]>(
    ATTRACTION_QUERY_KEY,
    old =>
      old
        ? old.map(a =>
          a.id === previousAttraction.id ? updatedAttraction : a
        )
        : [updatedAttraction]
  );
}

export function updateAttractionCacheOnDelete(queryClient: QueryClient, deletedAttractionId: number) {
  queryClient.setQueryData<Attraction[]>(ATTRACTION_QUERY_KEY, old => {
    if (!old) return [];

    return old.filter(a => a.id !== deletedAttractionId)
      .map(a => {
        if (a.id > deletedAttractionId) {
          return { ...a, id: a.id - 1 };
        }

        return a;
      });
  });
}