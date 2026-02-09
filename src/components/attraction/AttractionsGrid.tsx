import { AttractionCard } from './AttractionCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Attraction } from '@/types/Attraction'
import { formatDate } from '@/utils/formatters'
import { COUNTRIES } from '@/config/constants'

type GroupMode = 'country' | 'none'

interface AttractionsGridProps {
   attractions: Attraction[]
   groupBy?: GroupMode
   emptyTitle: string
   emptyDescription: string
   onToggleVisited?: (id: number) => void
   onDelete?: (id: number) => void
   onEdit?: (attraction: Attraction) => void
}

export function AttractionsGrid({
   attractions,
   groupBy = 'none',
   emptyTitle,
   emptyDescription,
   onToggleVisited,
   onDelete,
   onEdit
}: AttractionsGridProps) {
   if (attractions.length === 0) {
      return (
         <EmptyState
            icon="🗺️"
            title={emptyTitle}
            description={emptyDescription}
         />
      )
   }

   /**
    * 🔹 HOME — sem agrupamento por país
    */
   if (groupBy === 'none') {
      return (
         <div className="space-y-6">
            {Object.entries(
               attractions.reduce((acc, attraction) => {
                  const day = attraction.day
                  if (!acc[day]) acc[day] = []
                  acc[day].push(attraction)
                  return acc
               }, {} as Record<number, Attraction[]>)
            )
               .sort(([a], [b]) => Number(a) - Number(b))
               .map(([day, dayAttractions]) => (
                  <section key={day}>
                     <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">📅</span>
                        <h3 className="text-xl font-bold text-gray-900">
                           Dia {day}
                        </h3>

                        {dayAttractions[0]?.date && (
                           <span className="text-sm text-gray-500">
                              {formatDate(dayAttractions[0].date)}
                           </span>
                        )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dayAttractions.map(attraction => (
                           <AttractionCard
                              key={attraction.id}
                              attraction={attraction}
                              onCheckVisited={onToggleVisited}
                              onDelete={onDelete}
                              onClick={() => onEdit?.(attraction)}
                           />
                        ))}
                     </div>
                  </section>
               ))}
         </div>
      )
   }

   /**
    * 🔹 TELA DE ATRAÇÕES — agrupado por país → dia
    */
   const groupedByCountry = attractions.reduce((acc, attraction) => {
      const country = attraction.country ?? 'outros'
      const day = attraction.day

      if (!acc[country]) acc[country] = {}
      if (!acc[country][day]) acc[country][day] = []

      acc[country][day].push(attraction)
      return acc
   }, {} as Record<string, Record<number, Attraction[]>>)

   Object.values(groupedByCountry).forEach(days => {
      Object.keys(days).forEach(day => {
         days[Number(day)].sort((a, b) => a.order - b.order)
      })
   })

   return (
      <div className="space-y-10">
         {Object.entries(groupedByCountry).map(([country, days]) => (
            <section key={country} className="space-y-6">
               {/* Country header */}
               <div className="flex items-center gap-3">
                  <span className="text-2xl">🌍</span>
                  <h2 className="text-2xl font-bold text-gray-900">
                     {COUNTRIES[country as keyof typeof COUNTRIES]?.name ?? country}
                  </h2>
               </div>

               {Object.entries(days)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([day, dayAttractions]) => (
                     <section key={`${country}-${day}`}>
                        <div className="flex items-center gap-3 mb-4">
                           <span className="text-2xl">📅</span>
                           <h3 className="text-xl font-bold text-gray-900">
                              Dia {day}
                           </h3>

                           {dayAttractions[0]?.date && (
                              <span className="text-sm text-gray-500">
                                 {formatDate(dayAttractions[0].date)}
                              </span>
                           )}

                           <span className="text-sm text-gray-400">
                              {dayAttractions.length}{' '}
                              {dayAttractions.length === 1 ? 'atração' : 'atrações'}
                           </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {dayAttractions.map(attraction => (
                              <AttractionCard
                                 key={attraction.id}
                                 attraction={attraction}
                                 onCheckVisited={onToggleVisited}
                                 onDelete={onDelete}
                                 onClick={() => onEdit?.(attraction)}
                              />
                           ))}
                        </div>
                     </section>
                  ))}
            </section>
         ))}
      </div>
   )
}
