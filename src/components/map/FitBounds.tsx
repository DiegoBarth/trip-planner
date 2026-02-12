import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { isMappableAttraction } from '@/utils/typeGuards'
import type { Attraction } from '@/types/Attraction'

export function FitBounds({ attractions }: { attractions: Attraction[] }) {
   const map = useMap()

   useEffect(() => {
      if (!attractions.length) return

      const validPoints = attractions.filter(isMappableAttraction);

      if (validPoints.length > 0) {
         const bounds = L.latLngBounds(validPoints)
         map.fitBounds(bounds, { padding: [50, 50] })
      }

   }, [attractions, map])

   return null
}