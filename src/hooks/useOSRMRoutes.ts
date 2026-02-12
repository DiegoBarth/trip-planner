import { useEffect, useState } from 'react'
import type { Attraction } from '@/types/Attraction'
import { fetchOSRMRoute } from '@/services/osrmService'
import { isMappableAttraction } from '@/utils/typeGuards'

export function useOSRMRoutes(groupedByDay: Record<number, Attraction[]>) {
   const [routes, setRoutes] = useState<Record<number, [number, number][]>>({})
   const [distances, setDistances] = useState<Record<number, number>>({})

   useEffect(() => {
      async function loadRoutes() {
         const newRoutes: Record<number, [number, number][]> = {}
         const newDistances: Record<number, number> = {}

         for (const [dayNum, points] of Object.entries(groupedByDay)) {
            const validPoints = points.filter(isMappableAttraction)

            if (validPoints.length < 2) continue

            const result = await fetchOSRMRoute(
               validPoints.map(p => ({ lat: p.lat, lng: p.lng }))
            )

            if (result) {
               newRoutes[Number(dayNum)] = result.path
               newDistances[Number(dayNum)] = result.distanceKm
            }
         }

         setRoutes(newRoutes)
         setDistances(newDistances)
      }

      if (Object.keys(groupedByDay).length > 0) {
         loadRoutes()
      }
   }, [groupedByDay])

   return { routes, distances }
}