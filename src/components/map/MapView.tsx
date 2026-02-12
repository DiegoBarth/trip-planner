import { MapContainer, TileLayer } from 'react-leaflet'
import { useMemo } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { FitBounds } from './FitBounds'
import { MapSidebar } from './MapSidebar'
import { MapRoutes } from './MapRoutes'
import { useOSRMRoutes } from '@/hooks/useOSRMRoutes'
import { isMappableAttraction } from '@/utils/typeGuards'
import type { MappableAttraction } from '@/types/MappableAttraction'

const dayColors = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#dc2626', '#0891b2']

function getColorForDay(day: number) {
   return dayColors[(day - 1) % dayColors.length]
}

export function MapView() {
   const { attractions, country, day, isReady } = useCountry()

   // 🔹 Filtra e já garante lat/lng obrigatórios
   const filtered = useMemo(() => {
      return attractions
         .filter(a => country === 'all' || a.country === country)
         .filter(a => day === 'all' || a.day === Number(day))
         .filter(isMappableAttraction)
   }, [attractions, country, day])

   // 🔹 Agrupa por dia
   const groupedByDay = useMemo(() => {
      const grouped: Record<number, MappableAttraction[]> = {}

      filtered.forEach(a => {
         if (!grouped[a.day]) grouped[a.day] = []
         grouped[a.day].push(a)
      })

      return grouped
   }, [filtered])

   const { routes, distances } = useOSRMRoutes(groupedByDay)

   if (!isReady) return <div className="p-6">Loading...</div>
   if (!filtered.length) return <div className="p-6">No attractions found.</div>

   return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-120px)]">
         <MapSidebar distances={distances} getColor={getColorForDay} />

         <div className="flex-1">
            <MapContainer
               className="h-full w-full"
               zoom={13}
               scrollWheelZoom={true}
            >
               <TileLayer
                  attribution="© OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
               />

               <FitBounds attractions={filtered} />

               <MapRoutes
                  groupedByDay={groupedByDay}
                  routes={routes}
                  getColor={getColorForDay}
               />
            </MapContainer>
         </div>
      </div>
   )
}