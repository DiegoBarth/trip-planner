import type { QueryClient } from '@tanstack/react-query'
import type { Attraction, Country } from '@/types/Attraction'

const getAttractionQueryKey = (country: Country) => ['attractions', country]

/* ================= CREATE ================= */
export function updateAttractionCacheOnCreate(
   queryClient: QueryClient,
   country: Country,
   newAttraction: Attraction
) {
   const queryKey = getAttractionQueryKey(country)

   queryClient.setQueryData<Attraction[]>(queryKey, old =>
      old ? [...old, newAttraction] : [newAttraction]
   )
}

/* ================= UPDATE ================= */
export function updateAttractionCacheOnUpdate(
   queryClient: QueryClient,
   country: Country,
   previousAttraction: Attraction,
   updatedAttraction: Attraction
) {
   const queryKey = getAttractionQueryKey(country)

   queryClient.setQueryData<Attraction[]>(queryKey, old =>
      old
         ? old.map(a =>
            a.id === previousAttraction.id ? updatedAttraction : a
         )
         : [updatedAttraction]
   )
}

/* ================= DELETE ================= */
export function updateAttractionCacheOnDelete(
   queryClient: QueryClient,
   country: Country,
   deletedAttractionId: number
) {
   const queryKey = getAttractionQueryKey(country)

   queryClient.setQueryData<Attraction[]>(queryKey, old => {
      if (!old) return []
      
      return old
         .filter(a => a.id !== deletedAttractionId)
         .map(a => {
            if (a.id > deletedAttractionId) {
               return { ...a, id: a.id - 1 }
            }
            return a
         })
   })
}