import { MapContainer, TileLayer } from 'react-leaflet'
import { useMemo } from 'react'
import { useCountry } from '@/contexts/CountryContext'
import { FitBounds } from './FitBounds'
import { MapSidebar } from './MapSidebar'
import { MapRoutes } from './MapRoutes'
import { useOSRMRoutes } from '@/hooks/useOSRMRoutes'
import { isMappableAttraction } from '@/utils/typeGuards'
import type { MappableAttraction } from '@/types/MappableAttraction'
import { useLocation } from 'react-router-dom';

const dayColors = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#dc2626', '#0891b2']

function getColorForDay(day: number) {
   return dayColors[(day - 1) % dayColors.length]
}

export function MapView() {
   const { attractions, accommodations, country, day, isReady } = useCountry()
   const location = useLocation();

   // Filtra atrações mapeáveis
   const mappable = useMemo(() => {
      return attractions
         .filter(a => country === 'all' || a.country === country)
         .filter(isMappableAttraction)
   }, [attractions, country])

   // Se day !== 'all', filtra pelo dia
   let filtered: MappableAttraction[] = [];
   if (day !== 'all') {
      filtered = mappable.filter(a => a.day === Number(day));
   } else {
      // Se day == 'all', pega apenas atrações do próximo dia (igual Timeline)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureAttractions = mappable
         .filter(a => a.date)
         .map(a => ({
            ...a,
            parsedDate: new Date(a.date)
         }))
         .filter(a => a.parsedDate >= today);
      if (futureAttractions.length > 0) {
         futureAttractions.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
         const nextDate = futureAttractions[0].parsedDate.getTime();
         filtered = futureAttractions
            .filter(a => a.parsedDate.getTime() === nextDate)
            .map(({ parsedDate, ...rest }) => rest);
      }
   }

   // Agrupa por dia
   const groupedByDay = useMemo(() => {
      const grouped: Record<number, MappableAttraction[]> = {};
      filtered.forEach(a => {
         if (!grouped[a.day]) grouped[a.day] = [];
         grouped[a.day].push(a);
      });
      return grouped;
   }, [filtered]);

   // Lista de pontos para o mapa: atrações filtradas + acomodação(s)
   const mapPoints = useMemo(() => {
      if (accommodations && accommodations.length > 0) {
         // Evita duplicidade: só adiciona se não estiver já em filtered
         const filteredIds = new Set(filtered.map(a => a.id));
         const accs = accommodations.filter(acc => !filteredIds.has(acc.id));
         return [...filtered, ...accs];
      }
      return filtered;
   }, [filtered, accommodations]);

   const { routes, distances } = useOSRMRoutes(groupedByDay, accommodations);

   if (!isReady) return <div className="p-6">Loading...</div>
   if (!mapPoints.length) return <div className="p-6">No attractions or accommodations found.</div>

   return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-197.5px)] md:h-[calc(100vh-120px)]">
         <MapSidebar distances={distances} getColor={getColorForDay} />

         <div className="flex-1">
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
               />
            </MapContainer>
         </div>
      </div>
   )
}