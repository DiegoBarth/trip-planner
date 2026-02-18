import { MapContainer, TileLayer } from 'react-leaflet'
import { useMemo } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { useOSRMRoutesQuery } from '@/hooks/useOSRMRoutesQuery'
import { FitBounds } from './FitBounds'
import { MapRoutes } from './MapRoutes'
import { isMappableAttraction } from '@/utils/typeGuards'
import type { MappableAttraction } from '@/types/MappableAttraction'
import type { Attraction } from '@/types/Attraction'
import { useLocation } from 'react-router-dom'

const dayColors = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#dc2626', '#0891b2']

function getColorForDay(day: number) {
   return dayColors[(day - 1) % dayColors.length]
}

export function MapView() {
   const { attractions, accommodations, day, isReady } = useCountry()
   const location = useLocation()

   const mappable = useMemo(() => attractions.filter(isMappableAttraction), [attractions])

   const filtered = useMemo(() => {
      if (day !== 'all') return mappable.filter(a => a.day === Number(day))
      return mappable
   }, [mappable, day])

   const groupedByDay = useMemo(() => {
      const grouped: Record<number, MappableAttraction[]> = {}
      filtered.forEach(a => {
         if (!grouped[a.day]) grouped[a.day] = []
         grouped[a.day].push(a)
      })
      return grouped
   }, [filtered])

   const { routes } = useOSRMRoutesQuery(
      groupedByDay as Record<number, Attraction[]>,
      accommodations
   )

   // Próxima atração (primeira não visitada) para destacar no mapa (Modo Viagem)
   const highlightAttractionId = useMemo(() => {
      const sorted = [...filtered].sort((a, b) => a.order - b.order)
      const next = sorted.find(a => a.id !== -999 && !a.visited)
      return next?.id ?? null
   }, [filtered])

   // Lista de pontos para o mapa: atrações filtradas + acomodação(s)
   const mapPoints = useMemo(() => {
      if (accommodations && accommodations.length > 0) {
         // Evita duplicidade: só adiciona se não estiver já em filtered
         const filteredIds = new Set(filtered.map(a => a.id));
         const accs = accommodations.filter(acc => !filteredIds.has(acc.id));
         return [...filtered, ...accs];
      }
      return filtered;
   }, [filtered, accommodations])

   if (!isReady) return <div className="p-6">Loading...</div>
   if (!mapPoints.length) return <div className="p-6">No attractions or accommodations found.</div>

   return (
      <div className="h-[calc(100vh-186px)] md:h-[calc(100vh-147px-4rem)]">
         <MapContainer
               key={location.pathname}
               className="h-full w-full"
               zoom={13}
               scrollWheelZoom={true}
            >
               <TileLayer
                  attribution="© OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
               />

               <FitBounds attractions={mapPoints} />

               <MapRoutes
                  groupedByDay={groupedByDay}
                  routes={routes}
                  accommodations={accommodations}
                  getColor={getColorForDay}
                  highlightAttractionId={highlightAttractionId}
               />
         </MapContainer>
      </div>
   )
}